"""Build portable data products from the retained archive; no network or credentials."""
import csv, hashlib, html, io, json, pathlib, sqlite3, tempfile, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
def dump(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def write_csv(p,rows,fields):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
def main():
 history=json.loads((ROOT/'data/archive/history.json').read_text());out=ROOT/'data/exports';out.mkdir(exist_ok=True)
 fields=['dataset_id','series_id','series','date','value','unit','point_label','point_source','dataset_sources','archive_version']
 rows=[];catalog=[]
 for c in history['charts']:
  own=[]
  for s in c['series']:
   sid=c['id']+'_'+hashlib.sha256(s['name'].encode()).hexdigest()[:16]
   for p in s['points']:
    own.append(dict(zip(fields,[c['id'],sid,s['name'],p['date'],p.get('value'),c['unit'],p.get('label',''),p.get('source',''),' | '.join(x['url'] for x in c['sources']),history['last_snapshot']])))
  assert len({(r['series_id'],r['date']) for r in own})==len(own)
  rows+=own
  entry={k:c.get(k) for k in ['id','title','unit','kind','start','end','note','sources','archive_status']}
  entry.update(rows=len(own),series_count=len(c['series']),csv='datasets/'+c['id']+'.csv',json='datasets/'+c['id']+'.json')
  catalog.append(entry);write_csv(out/entry['csv'],own,fields);dump(out/entry['json'],{'metadata':entry,'observations':own})
 write_csv(out/'observations.csv',rows,fields)
 dump(out/'observations.json',{'schema_version':1,'archive_updated_at':history['updated_at'],'archive_version':history['last_snapshot'],'observations':rows})
 dump(out/'catalog.json',{'schema_version':1,'archive_updated_at':history['updated_at'],'datasets':catalog})
 schema={'schema_version':1,'primary_key':['series_id','date'],'fields':{
 'dataset_id':'Stable chart/dataset ID; never reassign IDs to other metrics.',
 'series_id':'Stable ID derived from dataset ID and exact series name; name changes create a new series.',
 'series':'Series label','date':'Source observation period/date, ISO 8601. Monthly dates may use day 01; see dataset note.',
 'value':'Number or null. Missing is not zero. SQL NULL / JSON null / empty CSV.',
 'unit':'Source unit; indices are NOT absolute quantities.',
 'point_label':'Qualification such as above/approximately/partial week; retain when reusing.',
 'point_source':'Point-specific disclosure URL when available.',
 'dataset_sources':'Dataset source URLs separated by |; includes attribution links.',
 'archive_version':'Version of this export, NOT a per-point fetched timestamp.'},
 'semantics':'Exports are chart-ready retained observations, not necessarily raw measurements. Download metrics are trailing seven-day sums. Ramp indices can be rebased; blocked merges retain old data. Do not interpolate disclosure points or convert null to zero. Raw source payloads and revisions are under ../archive/.',
 'license':'Underlying sources retain their rights. OpenRouter data requires CC BY 4.0 attribution. This export does not grant additional rights.',
 'timestamps':'archive_updated_at identifies the retained archive version, not proof every source was checked. See refresh-status.json for collection failures and unreviewed sources.'}
 dump(out/'schema.json',schema)
 db=out/'ai-pulse.sqlite';tmp=out/'ai-pulse.sqlite.tmp';tmp.unlink(missing_ok=True)
 with sqlite3.connect(tmp) as con:
  con.execute('CREATE TABLE observations ('+','.join(f+' '+('REAL' if f=='value' else 'TEXT') for f in fields)+', PRIMARY KEY(series_id,date))')
  con.executemany('INSERT INTO observations VALUES ('+','.join('?' for f in fields)+')',[tuple(r[f] for f in fields) for r in rows])
  con.execute('CREATE TABLE datasets (dataset_id TEXT PRIMARY KEY,title TEXT,unit TEXT,metadata_json TEXT)')
  con.executemany('INSERT INTO datasets VALUES (?,?,?,?)',[(c['id'],c['title'],c['unit'],json.dumps(c,ensure_ascii=False)) for c in catalog])
  con.execute('CREATE TABLE metadata (key TEXT PRIMARY KEY,value TEXT)');con.executemany('INSERT INTO metadata VALUES (?,?)',[('schema',json.dumps(schema,ensure_ascii=False)),('archive_updated_at',history['updated_at'])])
  assert con.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
  assert con.execute('SELECT COUNT(*) FROM observations').fetchone()[0]==len(rows)
 tmp.replace(db)
 with zipfile.ZipFile(out/'ai-pulse-data.zip','w',zipfile.ZIP_DEFLATED) as z:
  for p in sorted(out.rglob('*')):
   if p.is_file() and p.suffix not in ['.zip','.tmp'] and p.name!='manifest.json':z.write(p,p.relative_to(out))
 manifest={'schema_version':1,'archive_updated_at':history['updated_at'],'archive_version':history['last_snapshot'],'dataset_count':len(catalog),'observation_count':len(rows),'files':[]}
 for p in sorted(out.rglob('*')):
  if p.is_file() and p.name!='manifest.json':manifest['files'].append({'path':str(p.relative_to(out)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 dump(out/'manifest.json',manifest)
 e=html.escape
 cards=''.join('<section><h2>'+e(c['title'])+'</h2><p>'+e(c['unit'])+' · '+e(c['start'] or '미확보')+' ~ '+e(c['end'] or '미확보')+' · '+str(c['rows'])+'행</p><p>'+e(c['note'] or '')+'</p><a href="../data/exports/'+c['csv']+'" download>CSV</a> · <a href="../data/exports/'+c['json']+'" download>JSON</a></section>' for c in catalog)
 page='''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Pulse 데이터 보관함</title><style>body{max-width:1100px;margin:30px auto;padding:0 18px;background:#eef3fa;font:15px system-ui;color:#253950}a{color:#1766a0}section{background:white;padding:20px;margin:16px 0;border-radius:12px}h2{font-size:18px}p{line-height:1.7}.links{display:flex;gap:18px;flex-wrap:wrap}</style><a href="../">← 대시보드</a><h1>AI Pulse 데이터 보관함</h1><p>데이터를 내려받아 Excel·Python·다른 차트에서 사용하세요. 모든 링크는 로그인 없이 열립니다.</p>'''
 page+='<section><h2>전체 데이터</h2><div class="links">'+''.join('<a download href="../data/exports/'+f+'">'+label+'</a>' for f,label in [('ai-pulse-data.zip','전체 묶음 ZIP'),('observations.csv','전체 CSV'),('observations.json','전체 JSON'),('ai-pulse.sqlite','분석용 SQLite'),('catalog.json','지표 목록'),('schema.json','컬럼 설명'),('refresh-status.json','수집 상태')])+'</div><p>보관 버전: '+e(history['updated_at'])+' · '+str(len(catalog))+'개 지표 · '+str(len(rows))+'행 (결측 포함)</p><p>위 날짜는 보관본 갱신 시각이며, 모든 원출처의 최신화를 뜻하지 않습니다. 지표별 관측기간과 수집 상태를 확인하세요. 빈 값은 0이 아닙니다. 누적 다운로드·7일 합계·정규화 지수·발표 시점 수치를 서로 구분하세요.</p><a href="https://github.com/wonnnygim-commits/ai-pulse/tree/main/data/archive">원본·과거 버전·수정 이력</a></section><h2>지표별 다운로드</h2>'+cards+'</html>'
 (ROOT/'downloads').mkdir(exist_ok=True);(ROOT/'downloads/index.html').write_text(page)
 print(json.dumps({k:v for k,v in manifest.items() if k!='files'}))
if __name__=='__main__':main()
