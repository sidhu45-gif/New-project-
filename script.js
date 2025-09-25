
/* Final quiz app: page-by-page, levels per category, timer, review, leaderboard, AI chat (demo) */
const el = id=>document.getElementById(id);
let state = {
  name:'', category:'', level:'', questions:[], index:0, answers:[], score:0, timerId:null, timeLeft:20
};

const DATA = {
  children:{ easy:[
      {q:"2 + 2 = ?", opts:["3","4","5"], a:1},
      {q:"What sound does a dog make?", opts:["Meow","Bark","Moo"], a:1},
      {q:"Which fruit is red?", opts:["Apple","Banana","Orange"], a:0},
      {q:"Which shape has 3 sides?", opts:["Circle","Triangle","Square"], a:1},
      {q:"Sun rises in?", opts:["East","West","North"], a:0}
    ],
    medium:[
      {q:"5 + 7 = ?", opts:["10","11","12"], a:2},
      {q:"Largest planet?", opts:["Mars","Earth","Jupiter"], a:2},
      {q:"How many letters in English alphabet?", opts:["24","26","28"], a:1},
      {q:"Color of leaves?", opts:["Red","Green","Blue"], a:1},
      {q:"Which day comes after Friday?", opts:["Saturday","Sunday","Monday"], a:0}
    ],
    hard:[
      {q:"15 - 7 = ?", opts:["7","8","9"], a:1},
      {q:"Which is the largest animal?", opts:["Elephant","Blue Whale","Shark"], a:1},
      {q:"Who invented the bulb?", opts:["Newton","Einstein","Edison"], a:2},
      {q:"12 * 12 = ?", opts:["124","144","134"], a:1},
      {q:"How many continents?", opts:["5","6","7"], a:2}
    ]
  },
  school:{ easy:[
      {q:"Capital of India?", opts:["Delhi","Mumbai","Kolkata"], a:0},
      {q:"5 * 6 = ?", opts:["11","30","60"], a:1},
      {q:"National fruit of India?", opts:["Banana","Mango","Apple"], a:1},
      {q:"Who wrote Ramayana?", opts:["Valmiki","Vyasa","Kalidasa"], a:0},
      {q:"The square root of 81 is?", opts:["8","9","10"], a:1}
    ],
    medium:[
      {q:"Who discovered Gravity?", opts:["Einstein","Newton","Galileo"], a:1},
      {q:"Speed of light?", opts:["3x10^8 m/s","3x10^6 m/s","3x10^5 m/s"], a:0},
      {q:"What is HCl?", opts:["Hydrogen","Hydrochloric Acid","Helium"], a:1},
      {q:"First president of India?", opts:["Nehru","Rajendra Prasad","Gandhi"], a:1},
      {q:"Which gas is used by plants in photosynthesis?", opts:["CO2","O2","N2"], a:0}
    ],
    hard:[
      {q:"Who discovered Penicillin?", opts:["Alexander Fleming","Newton","Marie Curie"], a:0},
      {q:"Atomic number of Oxygen?", opts:["6","7","8"], a:2},
      {q:"Who discovered India?", opts:["Columbus","Vasco da Gama","Marco Polo"], a:1},
      {q:"Who wrote Hamlet?", opts:["Shakespeare","Milton","Wordsworth"], a:0},
      {q:"Which blood group is universal donor?", opts:["A","B","O-","AB+"], a:2}
    ]
  },
  college:{ easy:[
      {q:"H2O is?", opts:["Water","Oxygen","Hydrogen"], a:0},
      {q:"Derivative of x^2?", opts:["2x","x","x^2"], a:0},
      {q:"Who proposed relativity?", opts:["Newton","Einstein","Bohr"], a:1},
      {q:"π value?", opts:["3.14","22","2.17"], a:0},
      {q:"Who discovered electron?", opts:["Thomson","Newton","Faraday"], a:0}
    ],
    medium:[
      {q:"Integration of 1/x dx?", opts:["ln|x| + C","x + C","1/x + C"], a:0},
      {q:"Schrodinger is related to?", opts:["Biology","Chemistry","Quantum Physics"], a:2},
      {q:"Avogadro's number is?", opts:["6.022x10^23","9.81","3.14"], a:0},
      {q:"DNA full form?", opts:["Deoxyribo Nucleic Acid","Dynamic Nucleic Acid","None"], a:0},
      {q:"Planck's constant symbol?", opts:["h","p","c"], a:0}
    ],
    hard:[
      {q:"Heisenberg principle is in?", opts:["Chemistry","Physics","Biology"], a:1},
      {q:"First law of thermodynamics?", opts:["Energy conservation","Entropy","Mass conservation"], a:0},
      {q:"Newton's 2nd law?", opts:["F=ma","E=mc^2","V=IR"], a:0},
      {q:"Bohr model explains?", opts:["Hydrogen atom","All atoms","Nucleus"], a:0},
      {q:"SI unit of resistance?", opts:["Ohm","Ampere","Volt"], a:0}
    ]
  }
};

// navigation helpers
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.addEventListener('DOMContentLoaded', ()=>{
  // name continue
  el('btn-name-continue').addEventListener('click', ()=>{
    const name = el('player-name').value.trim();
    if(!name){ alert('Please enter your name'); return; }
    state.name = name;
    showPage('page-category');
  });
  // category buttons
  document.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click', function(){
    state.category = this.getAttribute('data-cat');
    showPage('page-level');
  }));
  // level buttons
  document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click', function(){
    state.level = this.getAttribute('data-level');
    // prepare questions (shuffle and slice 5)
    const pool = DATA[state.category][state.level].slice();
    state.questions = pool.sort(()=>Math.random()-0.5).slice(0,5);
    state.index = 0; state.answers = []; state.score = 0;
    showPage('page-quiz'); renderQuestion();
  }));
  // back buttons
  el('btn-cat-back').addEventListener('click', ()=> showPage('page-name'));
  el('btn-level-back').addEventListener('click', ()=> showPage('page-category'));
  el('btn-quiz-back').addEventListener('click', ()=>{
    if(state.index>0){ state.index--; renderQuestion(); } else showPage('page-level');
  });
  el('btn-quiz-next').addEventListener('click', ()=> nextQuestion());
  el('btn-results-home').addEventListener('click', ()=> location.reload());
  el('btn-results-leaderboard').addEventListener('click', ()=>{ renderLeaderboard(); showPage('page-leaderboard'); });
  el('btn-leaderboard-home').addEventListener('click', ()=> location.reload());
  el('btn-clear-leaderboard').addEventListener('click', ()=>{ localStorage.removeItem('quiz_leaderboard'); renderLeaderboard(); });

  // AI toggles
  el('btn-open-ai').addEventListener('click', ()=> el('ai-box').classList.toggle('hidden'));
  el('btn-close-ai').addEventListener('click', ()=> el('ai-box').classList.add('hidden'));
  el('ai-send').addEventListener('click', aiAsk);
  el('ai-input').addEventListener('keydown', (e)=>{ if(e.key==='Enter') aiAsk(); });

});

// render question
function renderQuestion(){
  clearInterval(state.timerId);
  state.timeLeft = 20; updateTimerUI();
  const qobj = state.questions[state.index];
  el('quiz-heading').textContent = `Q ${state.index+1} / ${state.questions.length} — ${state.category.toUpperCase()} | ${state.level.toUpperCase()}`;
  const wrap = el('question-wrap'); wrap.innerHTML = '';
  const qh = document.createElement('h3'); qh.textContent = qobj.q; wrap.appendChild(qh);
  qobj.opts.forEach((opt,i)=>{
    const d = document.createElement('div'); d.className='option' + (state.answers[state.index]===i? ' selected':''); d.textContent = opt;
    d.addEventListener('click', ()=>{ state.answers[state.index]=i; // select/unselect
      renderQuestion();
    });
    wrap.appendChild(d);
  });
  // start timer
  state.timerId = setInterval(()=>{
    state.timeLeft--; updateTimerUI();
    if(state.timeLeft<=0){ clearInterval(state.timerId); // skip without penalty
      nextQuestion();
    }
  },1000);
}

function updateTimerUI(){ el('timer').textContent = `⏳ ${state.timeLeft}s`; el('timer').style.color = state.timeLeft<=5? 'salmon':'#fff'; }

function nextQuestion(){
  clearInterval(state.timerId);
  // if last, finish
  if(state.index >= state.questions.length-1){ finishQuiz(); return; }
  state.index++; renderQuestion();
}

function finishQuiz(){
  clearInterval(state.timerId);
  // calculate score and prepare review
  let correct = 0; const review = [];
  state.questions.forEach((q,i)=>{
    const userIdx = state.answers[i];
    const ok = userIdx===q.a;
    if(ok) correct++;
    review.push({q:q.q, user: userIdx===undefined? null: q.opts[userIdx], correct: q.opts[q.a], ok});
  });
  state.score = correct;
  saveLeaderboard();
  // show results
  el('score-text').textContent = `${state.name}, you scored ${correct} / ${state.questions.length}`;
  const rev = el('review-list'); rev.innerHTML = '';
  review.forEach(r=>{
    const div = document.createElement('div'); div.className='review-item';
    if(r.ok){ div.innerHTML = `<div class="correct">✅ ${r.q}<br/><small>Answer: ${r.correct}</small></div>`; }
    else { div.innerHTML = `<div class="wrong">❌ ${r.q}<br/><small>Your: ${r.user? r.user: 'No answer'} | Correct: ${r.correct}</small></div>`; }
    rev.appendChild(div);
  });
  el('suggestion').textContent = suggestNext();
  showPage('page-results');
}

function saveLeaderboard(){
  const key='quiz_leaderboard'; const board = JSON.parse(localStorage.getItem(key) || '[]');
  board.push({name: state.name, score: `${state.score}/${state.questions.length}`, category: state.category, level: state.level, date: new Date().toLocaleString()});
  localStorage.setItem(key, JSON.stringify(board.slice(-50)));
}

function renderLeaderboard(){
  const key='quiz_leaderboard'; const board = JSON.parse(localStorage.getItem(key) || '[]');
  const list = el('leaderboard-list'); list.innerHTML='';
  if(board.length===0){ list.innerHTML='<li class="muted">No entries yet</li>'; return; }
  board.slice().reverse().forEach(it=>{ const li=document.createElement('li'); li.innerHTML=`<strong>${it.name}</strong> — ${it.score} <small class="muted">(${it.category}/${it.level})</small>`; list.appendChild(li); });
}

// suggestion
function suggestNext(){
  if(state.level==='easy') return 'Try medium level next!';
  if(state.level==='medium') return 'Try hard level next!';
  return 'Great job — try different categories!';
}

// simple AI tutor (rule-based demo)
function aiAsk(){
  const text = el('ai-input').value.trim(); if(!text) return;
  const box = el('ai-messages');
  const user = document.createElement('div'); user.className='ai-msg user'; user.textContent = text; box.appendChild(user);
  el('ai-input').value='';
  // simple responses
  let resp = "Sorry, I can't help with that yet. Try asking about math, physics, or chemistry.";
  const t = text.toLowerCase();
  if(t.includes('hint')||t.includes('help')) resp = "Hint: Read the question carefully. Use back to review before finishing.";
  if(t.includes('math')) resp = "Math tip: write steps, check arithmetic, remember multiplication tables.";
  if(t.includes('physics')) resp = "Physics tip: list known quantities and formulas first.";
  if(t.includes('chem')) resp = "Chemistry tip: balance equations, know common ions and formulas.";
  setTimeout(()=>{ const bot = document.createElement('div'); bot.className='ai-msg'; bot.textContent = resp; box.appendChild(bot); box.scrollTop = box.scrollHeight; }, 600);
}
window.el=el; // expose for debugging
