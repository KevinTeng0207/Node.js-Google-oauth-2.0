const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const { Google } = require('./config.json')
const port = 4000;

const app = express();

app.use(cors({
    origin: [
        "http://n108.wke.csie.ncnu.edu.tw",
        "https://n108.wke.csie.ncnu.edu.tw",
        "http://n108.wke.csie.ncnu.edu.tw:8888",
        "https://n108.wke.csie.ncnu.edu.tw:8888",
        "http://127.0.0.1:8888",
        "http://127.0.0.1:7777",
        Google.UI_ROOT_URI,
        Google.SERVER_ROOT_URI
    ],
    credentials: true, // enable set cookie
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
}));

app.get("/", (req, res) => {
    return res.send("HI");
});

app.use(cookieParser());

const redirectURI = "auth/google";

function getGoogleAuthURL() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: `${Google.SERVER_ROOT_URI}/${redirectURI}`,
        client_id: Google.GOOGLE_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
}

// Getting login URL
app.get("/auth/google/url", (req, res) => {
    return res.send(getGoogleAuthURL());
});

function getTokens(code, clientId, clientSecret, redirectUri) {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code: code.code,
        client_id: code.clientId,
        client_secret: code.clientSecret,
        redirect_uri: code.redirectUri,
        grant_type: "authorization_code",
    };
    // console.log(values)
    return axios
        .post(url, querystring.stringify(values), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
        .then((res) => res.data)
        .catch((error) => {
            console.error(`Failed to fetch auth tokens`);
            throw new Error(error.message);
        });
}


// Getting the user from Google with the code
app.get(`/${redirectURI}`, async (req, res) => {
    // const code = req.query.code as string;
    const code = req.query.code;
    // console.log(code)
    const { id_token, access_token } = await getTokens({
        code,
        clientId: Google.GOOGLE_CLIENT_ID,
        clientSecret: Google.GOOGLE_CLIENT_SECRET,
        redirectUri: `${Google.SERVER_ROOT_URI}/${redirectURI}`,
    });
    // Fetch the user's profile with the access token and bearer
    const googleUser = await axios
        .get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${id_token}`,
                },
            }
        )
        .then((res) => res.data)
        .catch((error) => {
            console.error(`Failed to fetch user`);
            throw new Error(error.message);
        });
    console.log(googleUser)
    const token = jwt.sign(googleUser, Google.JWT_SECRET);
        console.log(token)
    res.cookie(Google.COOKIE_NAME, token, {
        maxAge: 900000,
        httpOnly: true,
        secure: false,
    });

    res.redirect("http://localhost:4000/auth/me");
});

// Getting the current user
app.get("/auth/me", (req, res) => {
    console.log("get me");
    try {
        const decoded = jwt.verify(req.cookies[Google.COOKIE_NAME], Google.JWT_SECRET);
        console.log("decoded", decoded);
        return res.send(decoded);
    } catch (err) {
        console.log(err);
        res.send(null);
    }
});

app.listen(port, () => {
    console.log(`App listening http://localhost:${port}`);
});