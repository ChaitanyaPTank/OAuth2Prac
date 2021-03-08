const config = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const fetch = require("node-fetch"); // this is for shaping URL
const app = express();

config.config();
const client_id = process.env.ID;
const client_secret = process.env.SECRET;

app.use(express.json());
app.use(morgan("tiny"));

// This will fetch the token
const getTheToken = async (code) => {
    const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({
            client_id,
            client_secret,
            code
        })
    })
    const data = await res.text();
    const params = new URLSearchParams(data);
    return params.get("access_token");
}

// get user after getting token
const getGithubUser = async (token) => {
    const req = await fetch("http://api.github.com/user", {
        headers: {
            Authorization: `bearer ${token}`
        }
    });
    const data = await req.json();
    return data;
}

// home page
app.get("/home", (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_url=http://localhost:2021/callback`
    res.redirect(url);
});

// redirected page
app.get("/callback", async (req, res) => {
    const code = req.query.code;
    const token = await getTheToken(code);
    const gitHubData = await getGithubUser(token);
    res.json(gitHubData);
});

app.listen(2021, () => {
    console.log("Listening on http://localhost:2021");
});
