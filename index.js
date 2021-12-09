if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");

const nodemailer = require("nodemailer");
const mailer = require("./views/mailer");
const mailerForget = require("./views/mailerForget");

const Friendship = require("./models/friendship");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");

const User = require("./models/User");
const Newschool = require("./models/school");

const MongoStore = require("connect-mongo");

const multer = require("multer");

const uuid = require("uuid");

const { storage } = require("./cloudinary/index");
const console = require("console");

const upload = multer({ storage });

const dbUrl = "mongodb://localhost:27017/backery";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "squirrel",
  },
});

store.on("error", function (e) {
  console.log("Error to save to dataBase", e);
});

const sessionConfig = {
  store,
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

app.get("/newones", requiredLogin, (req, res) => {
  res.render("newone");
});

app.post("/news", upload.single("image"), async (req, res) => {
  // console.log(req.schoolody, req.file)
  const input = req.body;
  const school = new Newschool(input);
        school.schoolsname = req.body.schoolsname.toLowerCase();
        school.city = req.body.city.toLowerCase();
        school.provience = req.body.provience.toLowerCase();
        school.district = req.body.district.toLowerCase();
        school.Street = req.body.Street.toLowerCase();
        school.line = req.body.line.toLowerCase();
        school.image = req.file.path;
        school.creator.username = req.user.username;
        school.creator.name = req.user.name;
        school.creator.id = req.user.id;

  await school.save();
  res.redirect("/");
});

app.put("/news/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  
  const data = req.body;
    
  school = await Newschool.findByIdAndUpdate(id, data);
  school.image = req.file.path;

  school.save()
  res.redirect("/schools");
});

app.get("/news/:id", async (req, res) => {
  const { id } = req.params;
  const school = await Newschool.findById(id).populate("creatorbyId");
   const friendships = await Friendship.find({ schoolId: id });
  
  const uId = friendships.friendrequesterId;

  const allFriendships = await Friendship.find({});
  // for (let friend of allFriendships) {

  // }

  let friendRequesterID = undefined;
  for (let f of allFriendships) {
    
    if (req.user) {
      if (req.user.id === f.friendrequesterId) {
        friendRequesterID = f.friendrequesterId;
      } else {
        friendRequesterID = undefined;
      }
    }
  }

  const schoolFriend = await Newschool.findOne({ "creator.id": uId });
  
  res.render("schoolDetail", {
    school,
    friendships,
    schoolFriend,
    uId,
    allFriendships,
    friendRequesterID
  });
});

app.get("/news/:id/edit", requiredLogin, async (req, res) => {
  const { id } = req.params;
  const school = await Newschool.findById(id);
  res.render("edit", { school });
});

app.delete("/news/:id", async (req, res) => {
  const { id } = req.params;
  await Newschool.findByIdAndDelete(id);
  //  req.flash("mes", "Yes deleted a backery");
  res.redirect("/");
});

app.get('/deleteconfirm/:id',async (req, res) => {
  const { id } = req.params;
  const school = await Newschool.findById(id);
  res.render('schoolDelete',{id,school});
})

app.get("/schools", async (req, res) => {
  const schools = await Newschool.find({});

  res.render("schools", { schools });
});

app.get("/schoolimagedelete/:id", async (req, res) => {
  const { id } = req.params;
  const school = await Newschool.findById(id);

  school.image = req.file.path;
  try {
    await cloudinary.v2.uploader.destroy(
      image,
      { invalidate: true, resource_type: "path" },
      async (error, result) => {
        if (error) {
          return res.status(400).json(error);
        }
        await Property.updateOne({ $pull: { pictures: img } });
        res.json(result);
      }
    );
  } catch (e) {
    res.status(500).json("Something went wrong");
  }

  console.log(backery);
});

app.get("/", (req, res) => {
  res.render("home");
});

//CHECK STRING LENGTH
const isValidData = (value, stringLength) => {
  let inValid = new RegExp("^[_A-z0-9]{1,}$");
  let result = inValid.test(value);
  if (result && value.length >= stringLength) {
    return true;
  }
  return false;
};

//REGISTER USER
app.get("/register", (req, res) => {
  res.render("registerr");
});

app.post("/register", async (req, res) => {
  let username = req.body.username;
  
  let name = req.body.name;
  let role = req.body.role;
  let inputPassword = req.body.password;
  console.log("PASSWORD: ", username)
  let password;

  if (!isValidData(inputPassword, 6)) {
    console.log("Password must be at least 6 characters without space!");
  } else {
    password = inputPassword
  }

  const newUser = new User({
    username,
    name,
    role,
    activated: false,
  });

  let user = await User.findOne({ username: username });
  const err = "User with the Email already exist!"
  if (user) {
    res.render("registererror", { err });

  } else {
    await User.register(newUser, password);
  }

  // req.session.user_id = user._id;
  let { id } = await User.findOne({ username: username });
  mailer(
    username,
    "Welcome to web",
    "Yes you are very welcome now \n please activate ur account by clicking this link\n \n http://localhost:3000/activate/" +
      id
  ); //Detta lokal host ska ändras till domänen
  res.render("registerSuccess", { newUser });
  // res.render('login', {user})
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
  res.send(user);
});

app.get("/deleteuser/:id", async (req, res) => {
  const { id } = await req.params;
const user = await User.findById(id);
  res.render('deleteAccountconfirmation',{ user})
 
});
app.get("/deleteuserconfirm/:id", async (req, res)=>{
  const { id } = await req.params;
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
      return res.redirect("/users");
    });
  })(req, res, next);
});

app.get("/forgetpass", (req, res) => {
let tempid = uuid.v4();
  res.render("foreget", {tempid});
});

app.post("/forgetpass/:tempid", async (req, res) => {
  const {tempid}=await req.params;
  const { username } = req.body;

  await User.find({ username }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      res.send(user);
      mailerForget(
        username,
        "Welcome to web",
        "Yes you are very welcome now \n please activate ur account by clicking this link\n \n (http://localhost:3000/resetpass/" +
          tempid+'/'+username
      );
      //Detta lokal host ska ändras till domänen
    }
  });
});

//RESET PASSWORD
app.get("/resetpass/:tempid/:username", async (req, res) => {
  const { tempid } =await  req.params;
  const { username } =await req.params;
  res.render("resetpass", { tempid,username });
});

app.put("/resetpass/:tempid/:username", async (req, res) => {
  const { username } = req.body;
  console.log(username.substring(username.indexOf("/") + 1));
  const { password } = req.body;

  await User.findOne({ username }, (err, user) => {
    if (err) {
      res.send("Password reset Failed");
    } else {
      console.log("USER:", user);
      user.setPassword(password, (error, returnedUser) => {
        if (error) {
          console.log(error);
        } else {
          returnedUser.save();
        }
      });
      res.send(username);
    }
  });
});

app.get("/users", async (req, res) => {
  const allUsers = await User.find({});
  res.render("allUsers", { allUsers });
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const school = await Newschool.find({ "creator.id": id });
  res.render("showuser", { user, school});
});

app.get("/requestfriendship/:id", requiredLogin, async (req, res) => {
  const { id } = req.params;
  const school = await Newschool.findById(id);
  res.render("friendship", { id, school});
});

app.post("/friend/:id", async (req, res) => {
  const friended = new Friendship(req.body);
  const id = req.params;
  //finding the school which receive friendship request
  const school = Newschool.findById(id);
 
  // friendshipRequestedsSchoolsName = req.body.friendshipRequestedsSchoolsName;

 
  console.log(req.body)
  //finding the school which send friendship
  const fschool = await Newschool.findOne({
    "creator.id": req.body.friendrequesterid,
  });

  friended.friendshipRequestersSchoolsName = fschool.schoolsname;
  friended.friendrequesterid = req.body.friendrequesterid;

  const date = Date.now();
  friended.date = date.toString();
  friended.save();
  res.redirect("/");
});

app.get("/users/:username", async (req, res) => {
  const { username } = req.params;
  const user = await User.findById(username);
  res.render("showuser", { user });
});

app.get("/friendshipconfirm/:fid/:id", async (req, res) => {
  const { fid } = req.params;
  const { id } = req.params;
 
  const friendship = await Friendship.findById(fid);
console.log(friendship);
  const uid = friendship.friendrequesterid
  
  const fschool = await Newschool.findOne({ "creator.id": uid });
  
  const school = await Newschool.findById(id);
  res.render("friendshipconfirm", {friendship, school,fschool});
});

app.put("/friendshipconfirm/:id", async (req, res) => {
  const { id } = req.params;
  const confirmation = req.body.confirmation;
  const friendship = await Friendship.findByIdAndUpdate(id);
  friendship.confirmation = confirmation;
  friendship.save();
  res.redirect('/')
});

app.get("/friendship", async (req, res) => {
  const friendship = await Friendship.find({})
  res.render("friendships", {friendship} );
});

app.get('/users/:id/:uid/school', async (req, res) => {
  const { id } = req.params;
  const uid=req.params
  const user = await User.findById(id)
  const school = await Newschool.findOne({ "creator.id": id });
  const schoolId = school.id
  res.render('school',{school})
})

app.get("/search", (req, res) => {
  res.render("search");
});
app.get("/search/schoolname", (req, res) => {
  res.render("searchschoolname");
});

app.post("/search/schoolname", async (req, res) => {
  const input = req.body.schoolsname;
  const search = input.toLowerCase();
  const school = await Newschool.find({ 'schoolsname': search });
  res.render("resultschoolname", {school});
});

app.get("/search/provience", (req, res) => {
  res.render("searchp");
});

app.post("/search/provience", async (req, res) => {
  const input = req.body.provience;
  const search = input.toLowerCase();
  let query = {
    $or: [{ provience: search }, { city: search }, { district: search }],
  };

  const school = await Newschool.find(query);
  res.render("resultp", { school });
});

app.get("/search/village", (req, res) => {
  res.render("searchv");
});
app.post("/search/village", async (req, res) => {
  const input = req.body.vi;
  const search = input.toLowerCase();
  let query = {
    $or: [{ village: search }],
  };

  const school = await Newschool.find(query);
  res.render("resultP", { school });
});

app.get("/search/street", (req, res) => {
  res.render("searchStLn");
});
app.post("/search/street", async (req, res) => {
  const input = req.body.searchKey;
  const search = input.toLowerCase();

  let query = {
    $or: [{ Street: search }, { line: search }],
  };

  const school = await Newschool.find(query);
  res.render("resultp", { school });
});

app.get("/search/mobilenumber", (req, res) => {
  res.render("searchMnPc");
});

app.post("/search/mobilenumber", async (req, res) => {
  const input = req.body.searchKey;
  let query = {
    $or: [{ mobileNumber: input }, { postCode: input }],
  };

  const school = await Newschool.find(query);
  res.render("resultp", { school });
});

app.get("/search/economylevel", (req, res) => {
  res.render("searchel");
});

app.post("/search/economylevel", async (req, res) => {
  const input = req.body.searchKey;
  const school = await Newschool.find()
    .where("averageMonthlyIncomPerPerson")
    .lte(input)
    .exec();
  res.render("resultp", { school });
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

app.listen(3000, () => {
  console.log("School SERVER RUNNING!");
});
