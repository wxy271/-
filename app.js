const pages={overview:'总览',cashflow:'现金流',ledger:'记账本',assets:'资产负债',rules:'价格规则'};
const DEMO_STATE={budget:9500,spent:2658.4,currency:'CNY',transactions:[{date:'今天 08:32',name:'盒马鲜生',cat:'餐饮',account:'银行卡',amount:68,type:'negative'},{date:'昨天 18:20',name:'地铁出行',cat:'交通',account:'银行卡',amount:4,type:'negative'},{date:'6月15日',name:'自由职业收入',cat:'收入',account:'银行卡',amount:8800,type:'positive'},{date:'6月12日',name:'房租',cat:'居住',account:'银行卡',amount:3200,type:'negative'},{date:'6月10日',name:'Netflix',cat:'订阅',account:'银行卡',amount:65,type:'negative'}]};
const EMPTY_STATE={budget:0,spent:0,currency:'CNY',transactions:[]};
const loadState=()=>{try{return JSON.parse(localStorage.getItem('flowdesk-state'))||null}catch{return null}};
let state=loadState()||{...EMPTY_STATE,initialized:false};
const money=n=>Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const navItems=[...document.querySelectorAll('.nav-item')];
function saveState(){localStorage.setItem('flowdesk-state',JSON.stringify(state))}
function showPage(name){Object.keys(pages).forEach(p=>document.getElementById(`page-${p}`).classList.toggle('hidden',p!==name));navItems.forEach(n=>n.classList.toggle('active',n.dataset.page===name));document.getElementById('page-title').textContent=pages[name];if(name==='ledger')renderLedger()}
navItems.forEach(n=>n.addEventListener('click',()=>showPage(n.dataset.page)));
document.querySelectorAll('[data-page]').forEach(x=>x.addEventListener('click',()=>showPage(x.dataset.page)));
function renderRecent(){const list=document.getElementById('transaction-list');if(!state.transactions.length){list.innerHTML='<div class="empty-state">还没有交易，点击右上角“记一笔”开始。</div>';return}list.innerHTML=state.transactions.slice(0,4).map(t=>`<div class="transaction"><div class="tx-icon ${t.type==='positive'?'income':'home'}">${t.type==='positive'?'＋':'◎'}</div><div class="tx-name"><strong>${t.name}</strong><span>${t.cat} · ${t.date}</span></div><b class="amount ${t.type}">${t.type==='positive'?'+':'−'} ¥${money(t.amount)}</b></div>`).join('')}
function renderLedger(){const el=document.getElementById('ledger-rows');if(!state.transactions.length){el.innerHTML='<div class="empty-state">还没有记录。点击“记一笔”添加第一笔交易。</div>';return}el.innerHTML=state.transactions.map(t=>`<div class="ledger-row"><span>${t.date}</span><span><strong>${t.name}</strong><small>记录于 Flowdesk</small></span><span>${t.cat}</span><span>${t.account}</span><strong class="${t.type}">${t.type==='positive'?'+':'−'} ¥${money(t.amount)}</strong></div>`).join('')}
function applyState(){const spent=state.spent||0;const available=Math.max(0,(state.budget||0)-spent);document.getElementById('spent').textContent=spent.toLocaleString('en-US',{maximumFractionDigits:0});document.getElementById('available').textContent=available.toLocaleString('en-US',{maximumFractionDigits:0});document.getElementById('settings-budget').textContent=`¥${money(state.budget||0)}`;document.getElementById('currency-select').value=state.currency||'CNY';renderRecent();renderLedger()}
const expenseModal=document.getElementById('expense-modal');
function openModal(){expenseModal.classList.remove('hidden');document.getElementById('expense-amount').focus()}
function closeModal(){expenseModal.classList.add('hidden')}
document.getElementById('add-expense').onclick=openModal;document.getElementById('add-expense-2').onclick=openModal;document.querySelector('.close-modal').onclick=closeModal;expenseModal.addEventListener('click',e=>{if(e.target===expenseModal)closeModal()});
document.getElementById('save-expense').onclick=()=>{const amount=Number(document.getElementById('expense-amount').value||0);const name=document.getElementById('expense-name').value.trim()||'未命名支出';const cat=document.querySelector('#expense-modal select').value;if(amount<=0){alert('请先输入大于 0 的金额');return}state.transactions.unshift({date:'刚刚',name,cat,account:'银行卡',amount,type:'negative'});state.spent=(state.spent||0)+amount;state.initialized=true;saveState();applyState();document.getElementById('expense-amount').value='';document.getElementById('expense-name').value='';closeModal()};
document.getElementById('ask-advisor').onclick=()=>{const q=document.querySelector('.advisor-question strong');q.innerHTML='这笔支出会让<br/>我的目标更近吗？';setTimeout(()=>q.innerHTML='想买一桶蛋白粉<br/>¥295，值得吗？',2600)};
document.querySelectorAll('.segmented button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.segmented button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
document.querySelectorAll('.filter-chip').forEach(b=>b.onclick=()=>{if(['收入','支出','全部'].includes(b.textContent.trim())){document.querySelectorAll('.filter-chip').forEach(x=>x.classList.remove('active'));b.classList.add('active')}});
const setupModal=document.getElementById('setup-modal');
function closeSetup(){setupModal.classList.add('hidden');state.initialized=true;saveState();applyState()}
document.getElementById('start-empty').onclick=()=>{state={...EMPTY_STATE,initialized:true};closeSetup()};
document.getElementById('start-demo').onclick=()=>{state={...DEMO_STATE,transactions:DEMO_STATE.transactions.map(x=>({...x}))};closeSetup()};
const settingsModal=document.getElementById('settings-modal');
document.getElementById('open-settings').onclick=()=>{applyState();settingsModal.classList.remove('hidden')};
document.querySelector('.close-settings').onclick=()=>settingsModal.classList.add('hidden');settingsModal.addEventListener('click',e=>{if(e.target===settingsModal)settingsModal.classList.add('hidden')});
document.getElementById('clear-data').onclick=()=>{if(confirm('确定清空本设备上的全部交易和预算吗？')){state={...EMPTY_STATE,initialized:true};saveState();applyState();settingsModal.classList.add('hidden')}};
document.getElementById('restore-demo').onclick=()=>{state={...DEMO_STATE,transactions:DEMO_STATE.transactions.map(x=>({...x}))};saveState();applyState();settingsModal.classList.add('hidden')};
document.getElementById('edit-budget').onclick=()=>{const value=Number(prompt('输入本月可支出预算（元）',state.budget||0));if(Number.isFinite(value)&&value>=0){state.budget=value;saveState();applyState()}};
document.getElementById('currency-select').onchange=e=>{state.currency=e.target.value;saveState()};
applyState();
if(!state.initialized)setupModal.classList.remove('hidden');
