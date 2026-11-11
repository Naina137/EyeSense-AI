import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowRight, BookOpen, Camera, CheckCircle2, ChevronDown, CircleHelp, Eye, FileImage, Glasses, HeartPulse, Info, LoaderCircle, ScanLine, ShieldCheck, Sparkles, Upload, X } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import './styles.css'

const emptyEye = { sph: '0.00', cyl: '0.00', axis: '', add: '' }
const parseNumber = value => {
  const n = Number.parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
const formatPower = value => {
  const n = parseNumber(value)
  return `${n > 0 ? '+' : ''}${n.toFixed(2)} D`
}

function App() {
  const [activeTab, setActiveTab] = useState('scanner')
  const [right, setRight] = useState({ ...emptyEye })
  const [left, setLeft] = useState({ ...emptyEye })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [ocrText, setOcrText] = useState('')
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [showHelp, setShowHelp] = useState(false)

  const hasValues = [right, left].some(e => e.sph !== '0.00' || e.cyl !== '0.00' || e.add || e.axis)
  const summary = useMemo(() => {
    const powers = [parseNumber(right.sph), parseNumber(left.sph)]
    const max = Math.max(...powers.map(Math.abs))
    if (!hasValues) return null
    if (max < 0.50 && !parseNumber(right.cyl) && !parseNumber(left.cyl)) return 'Your entered values are close to plano (zero sphere).'
    if (powers.some(v => v < 0)) return 'Your prescription includes minus (negative) spherical power, commonly used to correct myopia (short-sightedness).'
    if (powers.some(v => v > 0)) return 'Your prescription includes plus (positive) spherical power, commonly used to correct hyperopia (long-sightedness).'
    return 'Your prescription includes cylinder values. These are used to correct astigmatism.'
  }, [right, left, hasValues])

  const onFile = e => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) { setStatus('Please choose an image file (JPG, PNG or WEBP).'); return }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setOcrText('')
    setStatus('Image ready. Select “Scan prescription” to extract text.')
  }

  async function scanImage() {
    if (!file) return
    setStatus('Preparing OCR engine…')
    setProgress(0)
    let worker
    try {
      worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
          if (m.status) setStatus(m.status === 'recognizing text' ? 'Reading prescription…' : m.status)
        }
      })
      const { data } = await worker.recognize(file)
      setOcrText(data.text || 'No readable text found. Try a clearer image.')
      setStatus('Scan complete. Check every value against the original prescription.')
    } catch (err) {
      setStatus('OCR could not read this image. You can enter the values manually below.')
    } finally {
      if (worker) await worker.terminate()
    }
  }

  function update(setter, key, value) {
    setter(prev => ({ ...prev, [key]: value }))
  }

  function reset() {
    setRight({ ...emptyEye }); setLeft({ ...emptyEye })
    setFile(null); setPreview(''); setOcrText(''); setStatus('Prescription values cleared.')
    setProgress(0)
  }

  const tabs = [
    { id: 'scanner', label: 'Prescription scanner', icon: ScanLine },
    { id: 'guide', label: 'Understand your numbers', icon: BookOpen },
    { id: 'care', label: 'Eye care guide', icon: HeartPulse }
  ]

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={() => setActiveTab('scanner')}>
        <span className="brand-mark"><Eye size={22}/></span>
        <span>eye<span className="brand-accent">sense</span><small>VISION, MADE CLEAR</small></span>
      </a>
      <div className="top-right"><span className="privacy"><ShieldCheck size={15}/> Private by design</span><button className="help-button" onClick={() => setShowHelp(true)}><CircleHelp size={17}/> Help</button></div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL VISION COMPANION</div>
          <h1>See your prescription<br/><span>in a whole new light.</span></h1>
          <p>Scan an existing spectacle prescription, understand what the numbers mean, and explore helpful eyewear guidance — all in one place.</p>
          <div className="hero-points"><span><CheckCircle2 size={16}/> Easy to understand</span><span><CheckCircle2 size={16}/> Simple & secure</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orb orb-one"></div><div className="orb orb-two"></div>
          <div className="eye-card"><div className="eye-illustration"><div className="iris"><div className="pupil"></div><span className="shine"></span></div></div><div className="scan-line"></div><div className="art-label"><ScanLine size={15}/> VISION SCAN</div></div>
          <div className="floating-chip chip-top"><Activity size={15}/> Clear insights</div><div className="floating-chip chip-bottom"><Glasses size={16}/> Better eyewear choices</div>
        </div>
      </section>

      <nav className="tabs" aria-label="Main navigation">
        {tabs.map(({id,label,icon:Icon}) => <button key={id} className={`tab ${activeTab===id?'active':''}`} onClick={() => setActiveTab(id)}><Icon size={17}/>{label}</button>)}
      </nav>

      {activeTab === 'scanner' && <section className="content-grid">
        <div className="panel upload-panel">
          <div className="section-heading"><div><span className="step">STEP 01</span><h2>Scan your prescription</h2><p>Upload a photo or take a picture of your existing prescription.</p></div><span className="heading-icon"><Camera size={20}/></span></div>
          <label className={`dropzone ${preview?'has-image':''}`}>
            {preview ? <><img src={preview} alt="Prescription preview"/><span className="image-overlay"><FileImage size={17}/> Change image</span></> : <><span className="upload-icon"><Upload size={23}/></span><strong>Drop your prescription here</strong><span>or browse files from your device</span><small>JPG, PNG or WEBP · Clear images work best</small></>}
            <input type="file" accept="image/*" capture="environment" onChange={onFile}/>
          </label>
          <div className="scan-actions"><button className="primary-button" disabled={!file || status==='Preparing OCR engine…' || status==='Reading prescription…'} onClick={scanImage}><ScanLine size={17}/> Scan prescription <ArrowRight size={16}/></button><button className="text-button" onClick={() => {setFile(null);setPreview('');setOcrText('');setStatus('')}}>Remove</button></div>
          {status && <div className="status-line"><span className="status-dot"></span>{status}</div>}
          {progress > 0 && progress < 100 && <div className="progress"><span style={{width:`${progress}%`}}/></div>}
          {ocrText && <div className="ocr-result"><div className="result-title"><CheckCircle2 size={17}/> Extracted text <span>Review carefully</span></div><pre>{ocrText}</pre><p>OCR is a reading aid, not a verified prescription. Enter the confirmed values in the form.</p></div>}
          <div className="privacy-note"><ShieldCheck size={16}/><span>Your image is processed in your browser. This app does not upload it to its own server.</span></div>
        </div>

        <div className="panel values-panel">
          <div className="section-heading"><div><span className="step">STEP 02</span><h2>Enter your eye power</h2><p>Type the values printed on your prescription.</p></div><span className="heading-icon"><Eye size={20}/></span></div>
          <div className="eye-form">
            <EyeFields title="Right eye (OD)" value={right} onChange={(k,v)=>update(setRight,k,v)} />
            <div className="form-divider"></div>
            <EyeFields title="Left eye (OS)" value={left} onChange={(k,v)=>update(setLeft,k,v)} />
          </div>
          <div className="field-hint"><Info size={15}/> Not every prescription includes CYL, AXIS or ADD. Leave unavailable fields blank.</div>
          <div className="form-actions"><button className="primary-button" onClick={() => setActiveTab('results')} disabled={!hasValues}>Understand my results <ArrowRight size={16}/></button><button className="text-button" onClick={reset}>Clear all</button></div>
        </div>
      </section>}

      {activeTab === 'results' && <section className="results-section">
        <div className="results-head"><div><span className="step">YOUR PRESCRIPTION OVERVIEW</span><h2>Let's make sense of your numbers.</h2><p>Educational interpretation of the values you entered.</p></div><button className="outline-button" onClick={() => setActiveTab('scanner')}>Edit values</button></div>
        {!hasValues ? <div className="empty-state"><Eye size={34}/><h3>No prescription values yet</h3><p>Enter your SPH, CYL and other values first.</p><button className="primary-button" onClick={() => setActiveTab('scanner')}>Go to scanner</button></div> : <>
          <div className="prescription-cards"><PrescriptionCard label="Right eye · OD" eye={right}/><PrescriptionCard label="Left eye · OS" eye={left}/></div>
          <div className="insight-card"><span className="insight-icon"><Sparkles size={20}/></span><div><h3>Your prescription explained</h3><p>{summary}</p><small>This is a general interpretation of entered numbers, not a diagnosis.</small></div></div>
          <Recommendations right={right} left={left}/>
        </>}
      </section>}

      {activeTab === 'guide' && <Guide/>}
      {activeTab === 'care' && <Care/>}

      <section className="disclaimer"><Info size={18}/><div><strong>Health disclaimer</strong><p>EyeSense AI cannot test your vision, measure eye power from a selfie, diagnose eye disease or prescribe glasses. Only a qualified eye-care professional can perform a proper eye examination. Seek urgent medical care for sudden vision loss, severe eye pain, flashes/floaters with a shadow, or sudden changes in vision.</p></div></section>
    </main>
    <footer><a className="brand footer-brand" href="#"><span className="brand-mark"><Eye size={19}/></span><span>eye<span className="brand-accent">sense</span><small>VISION, MADE CLEAR</small></span></a><span>Made to make eye-care information easier to understand.</span><span>© 2026 EyeSense AI</span></footer>

    {showHelp && <div className="modal-backdrop" onClick={() => setShowHelp(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowHelp(false)}><X size={19}/></button><span className="heading-icon"><CircleHelp size={21}/></span><h2>How to use EyeSense AI</h2><ol><li>Upload a clear photo of your existing prescription.</li><li>Choose <b>Scan prescription</b> to extract its printed text.</li><li>Manually enter the correct OD and OS values in the form.</li><li>Open <b>Understand my results</b> to see a plain-language guide.</li></ol><p className="modal-warning">Always verify OCR results against the original prescription and your eye-care professional's advice.</p><button className="primary-button" onClick={()=>setShowHelp(false)}>Got it</button></div></div>}
  </div>
}

function EyeFields({title,value,onChange}) {
  const fields = [
    {key:'sph',label:'SPH',placeholder:'0.00',hint:'Sphere'},
    {key:'cyl',label:'CYL',placeholder:'0.00',hint:'Cylinder'},
    {key:'axis',label:'AXIS',placeholder:'0–180',hint:'Degrees'},
    {key:'add',label:'ADD',placeholder:'e.g. +1.50',hint:'Near addition'}
  ]
  return <div className="eye-fields"><h3><span className="eye-dot"></span>{title}</h3><div className="field-grid">{fields.map(f=><label className="input-field" key={f.key}><span>{f.label}</span><input value={value[f.key]} onChange={e=>onChange(f.key,e.target.value)} placeholder={f.placeholder} inputMode="decimal"/><small>{f.hint}</small></label>)}</div></div>
}

function PrescriptionCard({label,eye}) {
  return <div className="prescription-card"><div className="prescription-title"><span className="eye-dot"></span>{label}</div><div className="power-grid">{[['SPH',formatPower(eye.sph)],['CYL',formatPower(eye.cyl)],['AXIS',eye.axis?`${eye.axis}°`:'—'],['ADD',eye.add?formatPower(eye.add):'—']].map(([k,v])=><div key={k}><small>{k}</small><strong>{v}</strong></div>)}</div></div>
}

function Recommendations({right,left}) {
  const maxPower = Math.max(Math.abs(parseNumber(right.sph)),Math.abs(parseNumber(left.sph)),Math.abs(parseNumber(right.cyl)),Math.abs(parseNumber(left.cyl)))
  const hasAdd = Boolean(right.add || left.add)
  const tips = []
  if (maxPower >= 4) tips.push(['Ask about high-index lenses','Higher-index lens materials may reduce edge thickness. An optician can compare options for your prescription and frame.'])
  else tips.push(['Compare lens materials','Ask your optician to compare standard and thinner lens materials based on your prescription, frame and budget.'])
  if (hasAdd) tips.push(['Discuss near-vision options','Your ADD values may indicate a near-vision correction. Ask whether reading, bifocal or progressive lenses suit your needs.'])
  if (parseNumber(right.cyl) || parseNumber(left.cyl)) tips.push(['Check astigmatism correction','Make sure CYL and AXIS are copied exactly. Even a small transcription error can affect lens accuracy.'])
  tips.push(['Choose a comfortable frame','Frame fit, lens size, bridge width and how the frame sits on your face all matter.'])
  return <div className="recommendations"><div className="section-heading"><div><span className="step">GENERAL GUIDANCE</span><h2>What to discuss with your optician</h2><p>Suggestions based on the information entered — not a prescription.</p></div><span className="heading-icon"><Glasses size={20}/></span></div><div className="recommendation-grid">{tips.map(([title,body],i)=><div className="recommendation" key={title}><span className="rec-number">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div></div>
}

function Guide() {
  const items = [
    ['SPH · Sphere','Measures the main lens power in diopters (D). A minus (−) value is commonly used for myopia; a plus (+) value is commonly used for hyperopia.'],
    ['CYL · Cylinder','Shows the amount of astigmatism correction. It may be written as a plus or minus value, or left blank if no cylinder correction is prescribed.'],
    ['AXIS','A number from 1° to 180° that indicates the orientation of the cylinder correction. It is meaningful when a CYL value is present.'],
    ['ADD · Addition','Extra plus power for near tasks, often used in reading or multifocal prescriptions. It is not present on every prescription.'],
    ['OD and OS','OD means right eye (oculus dexter). OS means left eye (oculus sinister). OU means both eyes.']
  ]
  return <section className="guide-section"><div className="results-head"><div><span className="step">THE BASICS</span><h2>How to read your eye prescription</h2><p>Here is what the common abbreviations mean.</p></div><span className="heading-icon"><BookOpen size={21}/></span></div><div className="guide-list">{items.map(([title,body],i)=><article className="guide-item" key={title}><span className="guide-index">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div><ChevronDown size={17}/></article>)}</div><div className="example-card"><div><span className="step">EXAMPLE ONLY</span><h3>What does −2.00 SPH mean?</h3><p>It indicates a minus spherical lens power of two diopters. Minus powers are commonly associated with myopia (difficulty seeing distant objects clearly). The number alone does not tell the whole story of your eye health.</p></div><div className="example-number">−2.00<small>SPH · D</small></div></div></section>
}

function Care() {
  const habits = [
    ['20-20-20 break','Every 20 minutes, look at something about 20 feet away for at least 20 seconds.'],
    ['Comfortable screen setup','Keep the screen around arm’s length away and slightly below eye level. Adjust brightness to your surroundings.'],
    ['Blink and hydrate','Remember to blink regularly during screen use. If your eyes feel persistently dry, ask an eye-care professional about suitable care.'],
    ['Protect your eyes outdoors','Wear sunglasses that provide 100% UVA/UVB protection when outdoors in bright sunlight.'],
    ['Schedule regular eye exams','Routine comprehensive eye exams can detect vision changes and some eye conditions early. Follow your clinician’s recommended schedule.']
  ]
  return <section className="care-section"><div className="results-head"><div><span className="step">HEALTHY HABITS</span><h2>Small habits. Better eye comfort.</h2><p>Everyday tips that can support comfortable vision.</p></div><span className="heading-icon"><HeartPulse size={21}/></span></div><div className="care-grid">{habits.map(([title,body],i)=><article className="care-card" key={title}><span className="care-icon">{[<Activity/>,<Eye/>,<Sparkles/>,<ShieldCheck/>,<HeartPulse/>][i]}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
}

createRoot(document.getElementById('root')).render(<App/>)
