require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");

const multer = require("multer");
const { storage } = require("./cloudinary/index");
const upload = multer({ storage });

const nodemailer = require("nodemailer");
const mailer = require("./views/mailer");
const mailerForget = require("./views/mailerForget");

const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");

const User = require("./models/user");
const Text = require("./models/text");

const MongoStore = require("connect-mongo")(session);

const uuid = require("uuid");

const console = require("console");
const { log } = require("console");

const dbUrl =
  "mongodb+srv://admin:admin@fairnews.ynril.mongodb.net/mynews?retryWrites=true&w=majority";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// const db = "news";
// mongoose.connect("mongodb://localhost:27017/" + db, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
// });

app.use(
  session({
    secret: "mriduava",
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
      url: dbUrl,
      touchAfter: 24 * 3600,
    }),
  })
);

// const secret = process.env.SECRET;
// const store = MongoDBStore.create({
//   //it is written url but it mackes error here
//   mongoUrl: dbUrl,
//   secret,
//   touchAfter: 24 * 60 * 60,
// });

// store.on("error", function (e) {
//   console.log("Error to save to dataBase", e);
// });

const sessionConfig = {
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
// app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  // res.locals.success = req.flash("success");
  // res.locals.error = req.flash("error");

  next();
});

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/public", express.static("public"));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const requiredLogin = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("secret");
});

app.get('/about', (req, res) => {
  res.render("about");
})

app.get("/admin", requiredLogin, async (req, res) => {
  const currentUser = req.user;
  if (currentUser.username == "admin@admin") {
    let text =await  Text.find({})
   
    res.render("admin",{text});
  } else {
    res.send("MMMM");
  }
});

app.get("/", async (req, res) => {
  if (!req.user) {
    const allText = await Text.find({});

    res.render("home", { allText });
  } else {
    const id = req.user.id;
    const allText = await Text.find({});
    res.render("home", { allText, id });
  }
});
app.get("/persian", async (req, res) => {
  if (!req.user) {
    const allText = await Text.find({ language: "Persian" });
    const id = allText.id;
    res.render("home1", { allText, id });
  } else {
    const id = req.user.id;
    const allText = await Text.find({ language: "Persian" });

    res.render("home", { allText, id });
  }
});

app.get("/swedish", async (req, res) => {
  if (!req.user) {
    const allText = await Text.find({ language: "ُSwedish" });

    const id = allText.id;
    res.render("home1", { allText, id });
  } else {
    const id = req.user.id;
    const allText = await Text.find({ language: "ُSwedish" });
    res.render("home", { allText, id });
  }
});

app.get("/english", async (req, res) => {
  if (!req.user) {
    const allText = await Text.find({ language: "English" });

    const id = allText.id;
    res.render("home1", { allText, id });
  } else {
    const id = req.user.id;
    const allText = await Text.find({ language: "English" });
    res.render("home", { allText, id });
  }
});

app.get("/textnotinlogd/:id", async (req, res) => {
  const id = req.params.id;
  const everyText = await Text.findById(id);
  res.render("everyTextnotinlogd", { everyText });
});

const isValidData = (str) => {
  var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
  return re.test(str);
};

//REGISTER USER
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  let username = req.body.username;

  let name = req.body.name;
  // let role = req.body.role;
  let proficiency = req.body.proficiency;
  let inputPassword = req.body.password;

  if (!isValidData(inputPassword)) {
    res.render("invalidpass");
  } else {
    password = inputPassword;
  }

  const newUser = new User({
    username,
    name,
    proficiency,
    activated: false,
  });

  let user = await User.findOne({ username: username });
  const err = "User with the Email already exist!";
  if (user) {
    res.render("registererror", { err });
  } else {
    await User.register(newUser, password);
  }

  

  let { id } = await User.findOne({ username: username });
  mailer(
    username,
    "Welcome to Iranian SE",
    "Yes you are very welcome now \n please activate ur account by clicking this link\n \n http://iranianse/activate/" +
      id
  ); //Detta lokal host ska ändras till domänen

  // req.session.user_id = user._id;
  // let { id } = await User.findOne({ username: username });

  res.render("registerSuccess", { newUser });
 
});

app.get("/activate/:id", async (req, res) => {
  let user = await User.findOne({ _id: req.params.id });
  if (user) {
    user.activated = true;
    await user.save();
    res.send("Account is activated now");
    res.redirect("http://localhost:3000/welcomeuser?id=" + req.params.id).end();
    res.render("loginWelcome");
  } else {
    res.send("Activation Failed");
  }
});

app.get("/users/edit/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.render("edituser", { user });
});

app.put("/users/edit/:id", async (req, res) => {
  const { id } = await req.params;
  console.log("id: ");

  const user = await User.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  user.save();
  res.redirect("/users/" + id);
});

app.get("/deleteuser/:id", async (req, res) => {
  const { id } = await req.params;
  const user = await User.findById(id);
  res.render("deleteAccountconfirmation", { user });
});
app.get("/deleteuserconfirm/:id", async (req, res) => {
  const { id } = await req.params;

  const text = await Text.find({ "author.id": id });

  await User.findByIdAndDelete(id);
  res.redirect("/");
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res, next) => {
  await passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user.username) {
      const worngUser = req.body.username;
      return res.render("wrongEmail", { worngUser });
    }
    if (!user) {
      const worngUser = req.body.username;
      return res.render("wrongpassword", { worngUser });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

app.get("/forgetpass", (req, res) => {
  let tempid = uuid.v4();
  res.render("foreget", { tempid });
});

app.post("/forgetpass/:tempid", async (req, res) => {
  const { tempid } = await req.params;
  const { username } = req.body;
  
  let user1 = await User.findOne({ username: username });
  if (!user1) {
    res.render("nouser", { username });
  } else {
       const user = await User.find({ username }, function (err, user) {
      if (err) {
        console.log(err);
      } else {
        mailerForget(
          username,
          "Iranian SE",
          "Have you forgatten your password?\n please click on the bellow link to enter your new password\n \n (http://iranianse/resetpass/" +
            tempid +
            "/" +
            username
        );

        res.render('resetpasslinksent',{username});
      }
    });
  }
});

//RESET PASSWORD
app.get("/resetpass/:tempid/:username", async (req, res) => {
  const { tempid } = await req.params;
  const { username } = await req.params;
  res.render("resetpass", { tempid, username });
});

app.put("/resetpass/:tempid/:username", async (req, res) => {
  const { username } = req.body;
  
  const { password } = req.body;

  await User.findOne({ username }, (err, user) => {
    if (err) {
      res.send("Password reset Failed");
    } else {
     
      user.setPassword(password, (error, returnedUser) => {
        if (error) {
          res.render("invalidpass");
        } else {
          returnedUser.save();
        }
      });
      res.render('resetpasssuccess');
    }
  });
});

app.get("/writenewtext", requiredLogin, (req, res) => {
  res.render("text");
});

app.post("/writenewtex", upload.single("f"), async (req, res) => {
  try {
 
    let id = req.user.id;
    let user = await User.findById(id);
    await Text.create(req.body, (err, text) => {
      if (err) {
        console.log(err);
      } else {
        
        // text.file = req.file.path;
        if (req.file === undefined) {
           text.file = "";
         } else {
            text.file = req.file.path;
         }
        text.author.name = user.name;
        text.author.id = user.id;
        // if (text.language == "undefined") {
        //   res.send("please select the language of your text");
        // }
        text.save();
       
        res.render("tnx");
      }
    });
  } catch (e) {
    return res.status(404).send("SOMETHING WRONG!");
  }
});

app.get("/confirmtext/:id",async (req, res) => {
  const {id} = req.params
  const text = await Text.findById(id)
  text.confirmed="yes";
 
  
  text.save()
  res.redirect("/")
});


app.get("/text/:id", async (req, res) => {
  const { id } = req.params;
  const text = await Text.findById(id);
  res.render("everytext", { text });
});

app.get("/edittext/:id", async (req, res) => {
  const { id } = req.params;
  const text = await Text.findById(id);

  res.render("textedit", { text });
});

app.put("/edittext/:id", async (req, res) => {
  const id = req.params.id;

  const text = await Text.findByIdAndUpdate(id, req.body);
 
  text.save()
  res.redirect("/");
});



app.get("/deletetext/:id", async (req, res) => {
  const { id } = req.params;
 
  const text = await Text.findById(id);
  res.render("deletetextconfirm", { text });
});

app.get("/deletetextconfirm/:id", async (req, res) => {
  const { id } = req.params;
  const text = await Text.findByIdAndDelete(id);
  res.redirect("/");
});

app.put("/deleteimage/:id", async (req, res) => {
  const { id } = req.params;
  const text = await Text.findByIdAndUpdate(id, { "file": "" });
  text.save();
  res.redirect("/");
});

app.put("/addimage/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  
  const text = await Text.findByIdAndUpdate(id);
  text.file = req.file.path;
  text.save();
  res.redirect("/");
});

app.get("/addimage/:id", async (req, res) => {
  const { id } = req.params;
  const text = await Text.findById(id)
  res.render('addimage',{text})
})

app.get("/alldialogues", requiredLogin, async (req, res) => {
  const id = req.user.id;

  const allText = await Text.find({});

  res.render("dialogue", { allText, id });
});

app.put("/dialogue/:id", async (req, res) => {
  const { id } = req.params;
  // const text = req.body.text
  // res.send(text)
  const text = await Text.findByIdAndUpdate(id, req.body, {
    runValidators: true,
  });
  res.redirect("/alldialogues");
});

app.get("/art", (req, res) => {
  res.render("art");
});

app.get("/users", async (req, res) => {
  const allUsers = await User.find({});
  res.render("allUsers", { allUsers });
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  const text = await Text.find({ "author.id": id });

  res.render("showuser", { user, text });
});

app.get("/users/:username", async (req, res) => {
  const { username } = req.params;
  const user = await User.findById(username);
  res.render("showuser", { user });
});

app.post("/api/login", async (req, res, next) => {
  await passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).send("Username or Password incorrect!");
    } else if (!user.activated) {
      return res.status(404).send("User is not Activated, pls Activate!");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res
        .status(200)
        .send({ id: user._id, username: user.username, role: user.role });
    });
  })(req, res, next);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.use((req, res) => {
  res.status(404).send(`<h1>The page is not defined</h1>`);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`IranianSE Serv on ${port}`);
});
