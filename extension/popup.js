const emailInput = document.getElementById('email');
const saveBtn = document.getElementById('saveEmail');
const clearBtn = document.getElementById('clearEmail');
const usageList = document.getElementById('usageList');
const refreshBtn = document.getElementById('refresh');

// Save email
saveBtn.addEventListener('click', ()=>{
  const email = emailInput.value.trim();
  if(!email) return alert('Enter email');
  chrome.storage.local.set({userEmail:email}, ()=>{
    alert('Email saved');
    emailInput.value='';
  });
});

// Clear email
clearBtn.addEventListener('click', ()=>{
  chrome.storage.local.remove('userEmail', ()=>{
    alert('Email cleared');
    chrome.runtime.sendMessage({type:'clearQueue'});
  });
});

// Load usage from background
function loadUsage(){
  chrome.runtime.sendMessage({type:'getUsage'}, res=>{
    const data = res.usage||{};
    usageList.innerHTML='';
    for(const [domain,sec] of Object.entries(data)){
      usageList.innerHTML+=`<li>${domain}: ${sec}s</li>`;
    }
  });
}

refreshBtn.addEventListener('click', loadUsage);
loadUsage();
