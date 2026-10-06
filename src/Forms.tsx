import {useMemo,useState} from 'react'

type Employee={id:number;code:string;name:string;department:string;job:string;grade?:string}
type Leave={id:number;employeeId:number;type:string;from:string;to:string;days:number;status:string;note:string}
type LeaveBalance={employeeId:number;year:string;annual:number;casual:number}
type Mission={id:number;employeeId:number;from:string;to:string;destination:string;purpose:string;status:string}
type MedicalExam={id:number;employeeId:number;date:string;type:string;result:string;doctor:string}

type FormType='اعتيادية'|'عارضة'|'كشف طبي'|'مأمورية'

type FormsProps={
  employees:Employee[]
  leaves:Leave[]
  balances:LeaveBalance[]
  missions?:Mission[]
  medicalExams?:MedicalExam[]
}

const days=(a:string,b:string)=>{
  if(!a||!b)return 0
  const x=new Date(a+'T00:00:00'),y=new Date(b+'T00:00:00')
  return Math.max(1,Math.floor((y.getTime()-x.getTime())/86400000)+1)
}
const fmt=(s:string)=>s?new Date(s+'T00:00:00').toLocaleDateString('ar-EG'):''
const today=()=>new Date().toISOString().slice(0,10)

export default function Forms({employees,leaves,balances,missions=[],medicalExams=[]}:FormsProps){
 const [type,setType]=useState<FormType>('اعتيادية')
 const [employeeId,setEmployeeId]=useState(employees[0]?.id||0)
 const [from,setFrom]=useState(today()),[to,setTo]=useState(today()),[issued,setIssued]=useState(today())
 const [manager,setManager]=useState(''),[authorized,setAuthorized]=useState('')
 const [previous,setPrevious]=useState(0)
 const [destination,setDestination]=useState(''),[purpose,setPurpose]=useState('')
 const [address,setAddress]=useState(''),[phone,setPhone]=useState('')
 const [durationValue,setDurationValue]=useState(1),[durationUnit,setDurationUnit]=useState<'يوم'|'ساعة'>('يوم')
 const [exitDate,setExitDate]=useState(today())
 const [medicalReason,setMedicalReason]=useState(''),[medicalDoctor,setMedicalDoctor]=useState('')
 const [medicalDiagnosis,setMedicalDiagnosis]=useState(''),[medicalTreatment,setMedicalTreatment]=useState('')
 const [medicalDate,setMedicalDate]=useState(today())
 const [openPreview,setOpenPreview]=useState(false)

 const emp=employees.find(e=>e.id===employeeId)
 const year=from.slice(0,4)
 const bal=balances.find(x=>x.employeeId===employeeId&&x.year===year)||{employeeId,year,annual:30,casual:7}
 const leaveType=type==='اعتيادية'?'اعتيادية':'عارضة'
 const granted=useMemo(
   ()=>leaves.filter(x=>x.employeeId===employeeId&&x.status==='معتمدة'&&x.type===leaveType&&x.from<=year+'-12-31'&&x.to>=year+'-01-01')
     .reduce((n,x)=>n+days(x.from,x.to),0),
   [leaves,employeeId,leaveType,year]
 )
 const entitled=type==='اعتيادية'?bal.annual:bal.casual
 const remaining=Math.max(0,entitled-granted)
 const leaveDuration=days(from,to)

 function loadMission(){
   const row=missions.find(x=>x.employeeId===employeeId)
   if(!row)return
   setFrom(row.from);setTo(row.to);setDestination(row.destination);setPurpose(row.purpose)
 }
 function loadMedical(){
   const row=medicalExams.find(x=>x.employeeId===employeeId)
   if(!row)return
   setMedicalDate(row.date);setMedicalDoctor(row.doctor);setMedicalDiagnosis(row.result)
 }

 return <section className="forms-page">
  <div className="panel">
   <div className="panel-header">
    <div><h2>النماذج الرسمية</h2><p>معاينة النموذج قبل الطباعة — النماذج مبنية على النماذج الورقية المرفوعة من الإدارة.</p></div>
   </div>

   <div className="form-grid">
    <label>نوع النموذج
      <select value={type} onChange={e=>setType(e.target.value as FormType)}>
       <option value="اعتيادية">طلب إجازة اعتيادية</option>
       <option value="عارضة">طلب إجازة عارضة</option>
       <option value="كشف طبي">طلب توقيع كشف طبي</option>
       <option value="مأمورية">نموذج تكليف مأمورية خط سير</option>
      </select>
    </label>
    <label>الموظف
      <select value={employeeId} onChange={e=>setEmployeeId(Number(e.target.value))}>
       {employees.map(e=><option key={e.id} value={e.id}>{e.name} — {e.code}</option>)}
      </select>
    </label>

    {(type==='اعتيادية'||type==='عارضة')&&<>
      <label>من<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
      <label>إلى<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
      <label>تحريراً في<input type="date" value={issued} onChange={e=>setIssued(e.target.value)}/></label>
      <label>رأي الرئيس المباشر<input value={manager} onChange={e=>setManager(e.target.value)} placeholder="يترك للتوقيع اليدوي"/></label>
      <label>اعتماد المدير المختص<input value={authorized} onChange={e=>setAuthorized(e.target.value)} placeholder="يترك للتوقيع اليدوي"/></label>
      {type==='اعتيادية'&&<label>رصيد سنوات سابقة<input type="number" min="0" value={previous} onChange={e=>setPrevious(Number(e.target.value)||0)}/></label>}
    </>}

    {type==='مأمورية'&&<>
      <label>الغرض من المأمورية<input value={purpose} onChange={e=>setPurpose(e.target.value)}/></label>
      <label>جهة تنفيذ المأمورية<input value={destination} onChange={e=>setDestination(e.target.value)}/></label>
      <label>العنوان<input value={address} onChange={e=>setAddress(e.target.value)}/></label>
      <label>رقم التليفون<input value={phone} onChange={e=>setPhone(e.target.value)}/></label>
      <label>من<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
      <label>إلى<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
      <label>المدة<input type="number" min="1" value={durationValue} onChange={e=>setDurationValue(Number(e.target.value)||1)}/></label>
      <label>وحدة المدة<select value={durationUnit} onChange={e=>setDurationUnit(e.target.value as 'يوم'|'ساعة')}><option>يوم</option><option>ساعة</option></select></label>
      <label>تاريخ الخروج<input type="date" value={exitDate} onChange={e=>setExitDate(e.target.value)}/></label>
      <label>اسم المدير المختص<input value={manager} onChange={e=>setManager(e.target.value)}/></label>
      <label>توقيع المدير المختص<input value={authorized} onChange={e=>setAuthorized(e.target.value)}/></label>
      <div className="form-actions full"><button className="view-btn" onClick={loadMission}>↻ جلب آخر مأمورية للموظف</button></div>
    </>}

    {type==='كشف طبي'&&<>
      <label>التاريخ<input type="date" value={medicalDate} onChange={e=>setMedicalDate(e.target.value)}/></label>
      <label>سبب العرض<input value={medicalReason} onChange={e=>setMedicalReason(e.target.value)}/></label>
      <label>اسم الطبيب<input value={medicalDoctor} onChange={e=>setMedicalDoctor(e.target.value)}/></label>
      <label>التشخيص<input value={medicalDiagnosis} onChange={e=>setMedicalDiagnosis(e.target.value)}/></label>
      <label className="full">العلاج<textarea value={medicalTreatment} onChange={e=>setMedicalTreatment(e.target.value)}/></label>
      <div className="form-actions full"><button className="view-btn" onClick={loadMedical}>↻ جلب آخر كشف طبي</button></div>
    </>}
   </div>

   <div className="form-actions">
    <button className="primary-btn" onClick={()=>setOpenPreview(true)}>👁️ معاينة النموذج</button>
    {type==='اعتيادية'||type==='عارضة'?<span className="muted">مدة الإجازة: {leaveDuration} يوم — الرصيد المتبقي: {remaining} يوم</span>:null}
   </div>
  </div>

  {openPreview&&<div className="modal-backdrop">
   <div className="modal forms-modal">
    <div className="modal-head"><h2>معاينة قبل الطباعة</h2><button onClick={()=>setOpenPreview(false)}>×</button></div>
    <div className="print-toolbar"><button className="primary-btn" onClick={()=>window.print()}>🖨️ طباعة النموذج</button><button className="secondary-btn" onClick={()=>setOpenPreview(false)}>إغلاق</button></div>

    {(type==='اعتيادية'||type==='عارضة')&&
      <div className="print-area official-form leave-official">
       <div className="official-head">
        <div><strong>شركة مصر الوسطى لتوزيع الكهرباء</strong><span>قطاع بني سويف</span><span>إدارة __________________</span></div>
        <div className="form-number">رقم النموذج: __________</div>
       </div>
       <h1>طلب إجازة {type}</h1>
       <div className="official-fields">
        <div><b>الاسم</b><span>{emp?.name||''}</span></div><div><b>الوظيفة</b><span>{emp?.job||''}</span></div>
        <div><b>جهة العمل</b><span>شركة مصر الوسطى لتوزيع الكهرباء — قطاع بني سويف</span></div><div><b>مدة الإجازة</b><span>{leaveDuration} يوم</span></div>
        <div><b>من</b><span>{fmt(from)}</span></div><div><b>إلى</b><span>{fmt(to)}</span></div>
        <div><b>تحريراً في</b><span>{fmt(issued)}</span></div><div><b>توقيع طالب الإجازة</b><span className="signature-line"></span></div>
       </div>
       {type==='اعتيادية'&&<p className="official-pledge">أتعهد بالالتزام بتعليمات قسم الإجازات.</p>}
       <h3>بيانات تستوفى بمعرفة قسم الإجازات</h3>
       <table className="official-table"><thead><tr>{type==='اعتيادية'&&<th>رصيد سنوات سابقة</th>}<th>الرصيد المتبقي من السنة الحالية</th><th>الإجازة السابق منحها في السنة الحالية</th><th>الإجازة المستحقة عن السنة الحالية</th></tr></thead>
        <tbody><tr>{type==='اعتيادية'&&<td>{previous}</td>}<td>{remaining}</td><td>{granted}</td><td>{entitled}</td></tr></tbody>
       </table>
       <table className="official-approval"><tbody><tr><th>رأي الرئيس المباشر</th><th>اعتماد المدير المختص</th></tr><tr><td>{manager||''}</td><td>{authorized||''}</td></tr></tbody></table>
      </div>
    }

    {type==='كشف طبي'&&
      <div className="print-area official-form medical-official">
       <div className="medical-head"><strong>السادة شركة الخدمات الطبية</strong><span>تحية طيبة وبعد ،،،</span></div>
       <p className="medical-intro">برجاء توقيع الكشف الطبي على السيد / <b>{emp?.name||''}</b></p>
       <div className="medical-fields">
        <div><b>جهة العمل:</b><span>شركة مصر الوسطى لتوزيع الكهرباء — قطاع بني سويف</span></div>
        <div><b>الرقم القومي:</b><span>{(emp as Employee&{nationalId?:string})?.nationalId||''}</span></div>
        <div><b>الوظيفة:</b><span>{emp?.job||''}</span><b>الدرجة:</b><span>{emp?.grade||''}</span></div>
        <div><b>التاريخ:</b><span>{fmt(medicalDate)}</span></div>
        <div><b>سبب العرض:</b><span>{medicalReason}</span></div>
       </div>
       <div className="medical-sign">توقيع المدير العام المختص<br/>الختم</div>
       <hr/>
       <div className="doctor-fields">
        <div><b>اسم الطبيب:</b><span>{medicalDoctor}</span></div>
        <div><b>التاريخ:</b><span>{fmt(medicalDate)}</span></div>
        <div><b>التشخيص:</b><span>{medicalDiagnosis}</span></div>
        <div className="wide"><b>العلاج:</b><span>{medicalTreatment}</span></div>
       </div>
       <div className="medical-approved">يعتمد،،،</div>
      </div>
    }

    {type==='مأمورية'&&
      <div className="print-area official-form mission-official">
       <div className="official-head">
        <div><strong>شركة مصر الوسطى لتوزيع الكهرباء</strong><span>قطاع بني سويف</span><span>الإدارة العامة __________________</span></div>
        <div className="form-number">( 0014 )</div>
       </div>
       <div className="mission-title">نموذج تكليف مأمورية<br/><small>خط سير</small></div>
       <div className="mission-fields">
        <div className="wide"><b>الغرض من المأمورية</b><span>{purpose}</span></div>
        <div><b>اسم القائم بالمأمورية</b><span>{emp?.name||''}</span></div><div><b>الوظيفة</b><span>{emp?.job||''}</span><b>الدرجة</b><span>{emp?.grade||''}</span></div>
        <div><b>جهة تنفيذ المأمورية</b><span>{destination}</span></div><div><b>العنوان</b><span>{address}</span><b>رقم التليفون</b><span>{phone}</span></div>
        <div className="wide mission-duration"><b>مدة المأمورية</b><span>( {durationValue} ) {durationUnit} — من {fmt(from)} حتى {fmt(to)}</span></div>
        <div className="wide"><b>تاريخ الخروج</b><span>{fmt(exitDate)}</span></div>
        <div className="wide"><b>اسم المدير المختص</b><span>{manager}</span><b>توقيعه</b><span>{authorized}</span></div>
        <div className="wide"><b>تحريراً في</b><span>{fmt(issued)}</span></div>
       </div>
       <div className="mission-notes">
        <p>صورة إلى شئون الأفراد للتأشير بالسجلات.</p>
        <p>صورة إلى مسؤول الوقت في حالة الخروج أو العودة منها أثناء وقت العمل الرسمي.</p>
       </div>
       <div className="mission-approval">يعتمد،،،</div>
      </div>
    }
   </div>
  </div>}
 </section>
}
