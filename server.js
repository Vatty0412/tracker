// importing modules
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from 'path';
import { fileURLToPath } from 'url';


// global arrays
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const classType = ["Lecture", "Tutorial", "Practical"];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const port = process.env.PORT || 3000;

// middleware
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.json());
app.use(cors());

// Loading Homepage
app.get('/', (req, res) => {
  res.send(path.join(__dirname, 'index.html'));
});

// connecting to DB
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://vatty-0412:Yg59B6myIE993llF@attendance-data.kcd77.mongodb.net/tracker-db';
mongoose.connect(mongoURI)
.then(() => console.log("Connected to the database"))
.catch(err => console.log("Cannot connect to the database.", err));

// Establishing Schema
const CourseSchema = mongoose.Schema({
     course_code: String,
     course_name: String,
     min_perc: {type: Number, default: 75}
});

const ProfileSchema = mongoose.Schema({
     "reg-no": Number,
     "full-name": String,
     "mnnit-mail-id": String,
     "password": String,
});

const UserSchema = mongoose.Schema({
     profile: ProfileSchema,
     courses: [CourseSchema],
     schedule: {type: [[mongoose.Schema.Types.Mixed]], default: Array.from({ length: 6 }, () => Array(10).fill(null))},
     attendance: {type: [[mongoose.Schema.Types.Mixed]], default: Array.from({ length: 6 }, () => Array(10).fill(null))},
     extraClasses: {type: [{date: String, course: CourseSchema, start: String, end: String, status: Number}], default: []}
});

const UserModel = mongoose.model('tracker-entries', UserSchema);

// sign-up User
const SignUpUser = async (req, res) => {
     const {password, ...otherDetails} = req.body;
     const saltRounds = 10;
     const hashedPassword = await bcrypt.hash(password, saltRounds);
     
     const userExists = await UserModel.findOne({"profile.reg-no": otherDetails["reg-no"]});
     if(userExists){
          console.log("User already registered!");
          return;
     }
     const newUser = new UserModel({
          profile: {password: hashedPassword,
          ...otherDetails}
     });

     try{
          await newUser.save();
          res.status(201).json({ message: "user added successfully!" });
          console.log("User added successfully.");
     } catch (err) {
          res.status(500).json({error: "Failed to Add User"});
          console.log("Failed to add users.");
     };
}
app.post('/signup-user', SignUpUser);

// Log-in User
const LogInUser = async (req, res) => {
     const {identifier, password} = req.body;
     const userExists = await UserModel.findOne({$or: [{"profile.reg-no": identifier}, {"profile.mnnit-mail-id": identifier}]});
     if(!userExists){
          console.log("This user is not registered.");
          return;
     };
     const isPasswordCorrect = await bcrypt.compare(password, userExists.profile.password);
     if (!isPasswordCorrect) {
          return res.status(500).send("Invalid password!");
     };

     res.status(200).json("Login successful!");
}
app.post('/login-user', LogInUser);

// Adding Course
app.post("/add-course", async (req, res) => {
     const fetched = req.body;
     try {
          const newCourse = new CourseModel(fetched);
          await newCourse.save();
          res.status(201).json({ message: "course added successfully!" });
          console.log("course added successfully!");
     } catch (err) {
          res.status(500).json({ error: "Failed to add course" });
          console.log("Failed to add course");
     }
});

// fetch today's courses
app.post("/fetch-courses-today", async (req, res) => {
     try {
          const courses = await CourseModel.find({"added_by": req.body.id, "schedule.day": 'monday'});
          res.json(courses);
     } catch (err) {
          res.status(500).json({error: "Failed to fetch users"});
     }
});

// fetch all courses
app.post("/fetch-courses-all", async (req, res) => {
     try {
          const courses = await CourseModel.find({"added_by": req.body.id});
          res.json(courses);
     } catch (err) {
          res.status(500).json({error: "Failed to fetch users"});
     }
});

// Running app
app.listen(port, () => {
     console.log(`Server running on port ${port}`);
});
