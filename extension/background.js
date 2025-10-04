let activeTabId = null;
let activeDomain = null;
let startTime = null;
let queue = [];
const MAX_BATCH = 50;

const classifier = {
  productive: ['stackoverflow.com','github.com','leetcode.com','docs.google.com'],
  unproductive: ['facebook.com','youtube.com','instagram.com','tiktok.com','reddit.com']
};

// Normalize domain
function normalizeDomain(hostname){
  if(!hostname) return null;
  hostname = hostname.toLowerCase().replace(/^www\./,'');
  if(hostname==='youtu.be') return 'youtube.com';
  return hostname;
}

function getDomain(url){
  try { return normalizeDomain(new URL(url).hostname); }
  catch{return null;}
}

function classifyDomain(domain){
  if(classifier.productive.includes(domain)) return 'productive';
  if(classifier.unproductive.includes(domain)) return 'unproductive';
  return 'neutral';
}

// Stop tracking current tab
function stopTracking(reason=''){
  if(activeDomain && startTime){
    const elapsedSec = Math.round((Date.now()-startTime)/1000);
    if(elapsedSec>0){
      // Save locally
      chrome.storage.local.get({usageData:{}}, res=>{
        const data = res.usageData;
        data[activeDomain] = (data[activeDomain]||0)+elapsedSec;
        chrome.storage.local.set({usageData:data});
      });

      // Push to queue for backend
      queue.push({
        domain: activeDomain,
        seconds: elapsedSec,
        category: classifyDomain(activeDomain)
      });
      flushQueue();
    }
  }
  startTime=null;
}

// Start tracking new domain
function startTracking(domain){
  if(activeDomain && activeDomain!==domain) stopTracking('switch');
  activeDomain = domain;
  startTime = Date.now();
}

// Chrome tab listeners
chrome.tabs.onActivated.addListener(async info=>{
  const tab = await chrome.tabs.get(info.tabId);
  startTracking(getDomain(tab.url));
});

chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{
  if(tab.active && changeInfo.url) startTracking(getDomain(changeInfo.url));
});

chrome.windows.onFocusChanged.addListener(windowId=>{
  if(windowId===chrome.windows.WINDOW_ID_NONE) stopTracking('blur');
  else chrome.tabs.query({active:true,windowId},tabs=>{
    if(tabs[0]) startTracking(getDomain(tabs[0].url));
  });
});

// Send queue to backend
async function flushQueue(){
  if(queue.length===0) return;
  chrome.storage.local.get('userEmail', async res=>{
    const email = res.userEmail;
    if(!email){
      queue=[]; // clear if no email
      return;
    }
    const batch = queue.splice(0, MAX_BATCH);
    try{
      await fetch('http://localhost:5000/api/usage',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({userEmail:email,events:batch})
      });
      console.log('Sent', batch.length, 'events for', email);
    }catch(err){
      console.error('Error sending usage', err);
      queue.unshift(...batch); // retry later
    }
  });
}

// Periodic flush
setInterval(flushQueue,15000);

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg.type==='getUsage'){
    chrome.storage.local.get('usageData',res=>{
      const data = {...res.usageData};
      if(activeDomain && startTime){
        data[activeDomain] = (data[activeDomain]||0)+Math.round((Date.now()-startTime)/1000);
      }
      sendResponse({usage:data});
    });
    return true;
  }

  if(msg.type==='clearQueue'){
    queue=[];
    sendResponse({ok:true});
    return true;
  }
});
