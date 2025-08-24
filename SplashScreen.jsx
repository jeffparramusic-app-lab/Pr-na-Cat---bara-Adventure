import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen({ onDone }){
  const [text, setText] = useState('')
  const msg = 'Bienvenido a\nPräna Cat-π-bara'
  useEffect(()=>{
    const ding = new Audio('/sounds/ding.wav'); ding.play().catch(()=>{})
    let i=0
    const id = setInterval(()=>{
      setText(msg.slice(0, i+1))
      i++
      if(i>=msg.length){
        clearInterval(id)
        setTimeout(()=>{
          const swish = new Audio('/sounds/swish.wav'); swish.play().catch(()=>{})
          onDone()
        }, 500)
      }
    }, 50)
    return ()=>clearInterval(id)
  }, [onDone])

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="splashWrap"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        style={{
          backgroundImage: 'url(/originals/prana-cat-pi-bara-full.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: .96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign:'center', padding:'20px', backdropFilter:'blur(2px) contrast(1.05)' }}
        >
          <motion.pre
            className="splashText"
            style={{ whiteSpace:'pre-wrap', fontSize: 28, margin: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {text}
          </motion.pre>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
