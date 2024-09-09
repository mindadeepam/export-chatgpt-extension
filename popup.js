document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('extract').addEventListener('click', handleExtraction);
});

function handleExtraction() {
  const fileNameInput = document.getElementById('fileName');
  const fileName = fileNameInput.value.trim() || getDefaultFileName();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: extractMessages
      },
      (results) => {
        const output = document.getElementById('output');
        if (results && results[0] && results[0].result) {
          const messages = results[0].result;
          output.textContent = 'Messages extracted!';
          saveMessagesToFile(messages, fileName);
        } else {
          output.textContent = 'No messages found.';
        }
      }
    );
  });
}

function extractMessages() {
  const messages = [];
  const messageDivs = document.querySelectorAll('div[data-message-author-role]');

  messageDivs.forEach(div => {
    const role = div.getAttribute('data-message-author-role');
    const content = div.textContent.trim();
    if (role === 'user' || role === 'assistant') {
      messages.push({ type: role, content: content });
    }
  });

  return messages;
}

function getDefaultFileName() {
  return `chatgpt-explains-${new Date().toISOString().split('T')[0]}`;
}

function saveMessagesToFile(messages, fileName) {
  const jsonContent = JSON.stringify(messages, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  document.getElementById('output').textContent = `File saved as ${fileName}.json`;
}