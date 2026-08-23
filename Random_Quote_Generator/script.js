const btn = document.getElementById("btn");
const quote = document.getElementById("quote");
const author = document.getElementById("author");

const apiURL = "https://api.quotable.io/random";

async function getQuote() {
  try {
    btn.innerText = "Loading...";
    btn.disabled = true;
    quote.innerText = "Updating...";
    author.innerText = "Updating...";
    const response = await fetch(apiURL);
    const data = await response.json();
    const quoteContent = data.content;
    const quoteAuthor = data.author;

    quote.innerText = quoteContent;
    author.innerText = `~ ${quoteAuthor}`;

    btn.innerText = "Get Quote";
    btn.disabled = false;
  } catch (error) {
    console.log(error);
    quote.innerText = "An error occured, Please try again later...";
    author.innerText = "ERR! OCCURED...";
    btn.innerText = "Loading...";
    btn.disabled = false;
  }
}

getQuote();

btn.addEventListener("click", getQuote);
