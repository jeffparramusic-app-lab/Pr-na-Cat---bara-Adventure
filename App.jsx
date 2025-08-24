import { useEffect, useMemo, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import SplashScreen from './SplashScreen.jsx'

export default function App(){
  const [showSplash, setShowSplash] = useState(true)
  const [theme, setTheme] = useState('capy')
  const [operation, setOperation] = useState('multiplication')
  const [mode, setMode] = useState('show')
  const [quiz, setQuiz] = useState(false)
  const [maxN, setMaxN] = useState(12)
  const [revealed, setRevealed] = useState(()=>new Set())

  const [quizTarget, setQuizTarget] = useState(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [flash, setFlash] = useState(null)

  const sounds = useRef({})
  useEffect(()=>{
    sounds.current = {
      tap: new Audio('/sounds/tap.wav'),
      correct: new Audio('/sounds/correct.wav'),
      wrong: new Audio('/sounds/wrong.wav')
    }
    Object.values(sounds.current).forEach(a=>{ a.volume = 0.4 })
  }, [])

  const numbers = useMemo(()=>Array.from({length: maxN}, (_,i)=>i+1), [maxN])

  useEffect(()=>{
    if(theme==='cat'){
      document.documentElement.style.setProperty('--bg1', '#ffe4e6')
      document.documentElement.style.setProperty('--bg2', '#e0f2fe')
      document.documentElement.style.setProperty('--accent', '#f9a8d4')
    }else{
      document.documentElement.style.setProperty('--bg1', '#e0ffe7')
      document.documentElement.style.setProperty('--bg2', '#dbeafe')
      document.documentElement.style.setProperty('--accent', '#86efac')
    }
  },[theme])

  const calculate = (a,b) => {
    switch(operation){
      case 'addition': return a + b
      case 'subtraction': return a - b
      case 'multiplication': return a * b
      case 'division': return Number((a / b).toFixed(2))
      default: return ''
    }
  }

  const newQuiz = () => {
    const a = 1 + Math.floor(Math.random()*maxN)
    const b = 1 + Math.floor(Math.random()*maxN)
    setQuizTarget({ a, b, result: calculate(a,b) })
  }

  useEffect(()=>{
    if(quiz){ newQuiz() }
    setRevealed(new Set())
  }, [quiz, operation, maxN])

  const onCellClick = (id, a, b) => {
    if(!quiz){
      const s = new Set(revealed)
      s.has(id) ? s.delete(id) : s.add(id)
      setRevealed(s)
      sounds.current.tap?.play().catch(()=>{})
    }else{
      const value = calculate(a,b)
      setAttempts(x=>x+1)
      const ok = value === quizTarget?.result
      setFlash(ok ? 'ok' : 'no')
      if(ok){
        sounds.current.correct?.play().catch(()=>{})
        setScore(x=>x+1)
        setTimeout(()=>{
          setFlash(null)
          newQuiz()
        }, 350)
      }else{
        sounds.current.wrong?.play().catch(()=>{})
        setTimeout(()=>setFlash(null), 350)
      }
    }
  }

  const resetReveal = () => setRevealed(new Set())

  return (
    <div className="container">
      {showSplash && <SplashScreen onDone={()=>setShowSplash(false)} />}

      {!showSplash && (
        <>
          <header style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:12}}>
            <img src="/logo.png" alt="logo" className="logo" />
            <motion.h1 initial={{opacity:0, y:-8}} animate={{opacity:1, y:0}} transition={{duration:.5}} style={{margin:0,fontSize:24,fontWeight:800}}>
              Präna Cat-π-bara {theme==='cat'?'😺':'🦫'}
            </motion.h1>
            <div className="toolbar">
              <select className="select" value={theme} onChange={e=>setTheme(e.target.value)}>
                <option value="capy">Tema Capibara Zen 🦫</option>
                <option value="cat">Tema Gatitos 😺</option>
              </select>

              <select className="select" value={operation} onChange={e=>{setOperation(e.target.value); resetReveal();}}>
                <option value="addition">➕ Suma</option>
                <option value="subtraction">➖ Resta</option>
                <option value="multiplication">✖️ Multiplicación</option>
                <option value="division">➗ División</option>
              </select>

              <select className="select" value={mode} onChange={e=>{setMode(e.target.value); resetReveal();}} disabled={quiz}>
                <option value="show">👀 Mostrar todo</option>
                <option value="click">🎮 Modo interactivo</option>
              </select>

              <label className="badge">Rango: 1–
                <input className="input" type="number" min="3" max="100" value={maxN} onChange={e=>setMaxN(Math.max(3, Math.min(100, Number(e.target.value)||12)))} style={{width:60, marginLeft:6}}/>
              </label>

              <button className="button" onClick={resetReveal} disabled={quiz}>🔄 Reiniciar</button>
              <button className="button" onClick={()=>setQuiz(q=>!q)}>{quiz?'🧩 Salir de Quiz':'🧩 Modo Quiz'}</button>
            </div>

            {quiz && (
              <div className="badge" style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                <strong>Objetivo:</strong> {quizTarget ? `${quizTarget.a} ${{'addition':'+','subtraction':'−','multiplication':'×','division':'÷'}[operation]} ${quizTarget.b}` : '...'} → {quizTarget?.result}
                <span className="small">Puntaje: {score}/{attempts}</span>
              </div>
            )}
          </header>

          <div className="grid" style={{ ['--cols']: (maxN+1) }}>
            <div></div>
            {numbers.map((n)=>(
              <div key={'c'+n} className="headerCell">{n}</div>
            ))}

            {numbers.map((row)=>(
              <div key={'rowwrap-'+row} style={{display:'contents'}}>
                <div className="leftCell">{row}</div>
                {numbers.map((col)=>{
                  const id = `${row}-${col}`
                  const value = calculate(row, col)
                  const show = mode==='show' || (!quiz && mode==='click' && revealed.has(id)) || (quiz && value===quizTarget?.result)
                  const activeQuiz = quiz && value===quizTarget?.result
                  const wrongQuiz = quiz && flash==='no' && value!==quizTarget?.result
                  return (
                    <motion.button
                      key={id}
                      onClick={()=>onCellClick(id, row, col)}
                      className="cell"
                      whileTap={{ scale: .92 }}
                      animate={flash==='ok' && activeQuiz ? { scale: [1,1.15,1], rotate:[0,6,0] } : (wrongQuiz ? { x:[0,-6,6,0] } : {})}
                      transition={{ duration: .3 }}
                      title={`${row} × ${col}`}
                    >
                      {show ? (
                        <motion.span initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}}>{value}</motion.span>
                      ) : (
                        <span>{theme==='cat'?'🐾':'✨'}</span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="footer">
            <span className="small">Hecho con ❤️ y π — {new Date().getFullYear()}</span>
            <span className="small">Tema: {theme==='cat' ? 'Gatitos' : 'Capibara Zen'}</span>
          </div>
        </>
      )}
    </div>
  )
}
