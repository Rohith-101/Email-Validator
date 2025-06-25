
btn.addEventListener("click", async (e) => {
  e.preventDefault()
  resultcont.innerHTML = "";
  
  const email = document.getElementById("username").value;
  const res = await fetch(`YOUR_API_REQUEST_URL`);
  const data = await res.json();
  
  for (let [key, value] of Object.entries(data)) {
    
    if (value != "" && value != " ") {
      resultcont.innerHTML += `<div>${key}: ${value}</div>`;
    }
    
  }

 
})




















