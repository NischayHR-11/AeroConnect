const express=require("express");
const app=express();
const port=3000;
const mongoose=require("mongoose");
const flight=require("./models/flight.js");
const arrival=require("./models/arrival.js");
const departure=require("./models/departure.js");
const staff=require("./models/staff.js");
const booking=require("./models/booking.js");
const user =require("./models/user.js");

const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);


const session=require("express-session");
const flash=require("connect-flash");
app.use(express.json()); 
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

//middleware for cookie
const cookieParser=require("cookie-parser");  //for accesing the cookie
app.use(cookieParser());

const sessionOptions={
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httponly:true,
    },
}
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//middleware for initializing and should be implemented after session only
app.use(passport.session());//middleware that does not cause to user to login again while navigating diff pages//stores a session
passport.use(new LocalStrategy(User.authenticate()));//static met added by passport-local-mongoose

passport.serializeUser(User.serializeUser());//serializes user to session//stores info
passport.deserializeUser(User.deserializeUser());//deserializes

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curruser=req.user;
    next();
})

main().then((res)=>{
    console.log("connection sucessfull");
})
.catch((err)=>{
    console.log(err);
});
async function main()
{
    await mongoose.connect("mongodb://127.0.0.1:27017/airport");
}

//Payment Gateway
require("dotenv").config()

const cors = require("cors")
app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:5500",
  })
)

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const storeItems = new Map([
  [1, { priceInCents: 100000, name: "Aero Company and co" }],
])

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      success_url:"http://localhost:3000/",
      cancel_url: "http://localhost:3000/",
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
//finish 

const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.redirectURL=req.originalUrl;
        req.flash("error","please login");
        res.redirect("/login");
    }
    else
    {
        next();
    }
}
//store into local variable since passport resets the req.session.redirecturl
const redirectURL=(req,res,next)=>{
    if(req.session.redirectURL){
    res.locals.redirectURL=req.session.redirectURL;
    }
    next();
};

//ROUTER
const login=require("./routes/login.js");
const { SourceTextModule } = require("vm");
const Flight = require("./models/flight.js");
const { date } = require("joi");
const { error } = require("console");
app.use("/login",login);



app.listen(3000,()=>{
    console.log("listening to 3000");
})

app.get("/",(req,res)=>{
   res.render("home.ejs");
})

app.get('/favicon.ico', (req, res) => {
    res.status(204).send(); // Sends a "No Content" response
});


app.get("/flights",isLoggedIn,async (req,res)=>{
    //list of available flights

    let flightsss= await flight.find().populate(["arrival","departures","staffs"]);

    console.log(flightsss);
    res.render("flights.ejs",{flightsss});
});

app.get("/addflight",isLoggedIn,(req,res)=>{
    res.render("addFlight.ejs");
})

app.post("/addFlight",isLoggedIn,async(req,res)=>{

    let result=req.body;
    const newflight= new flight(
        {
            airline_company:result.airline_company,
            aircraftModel:result.aircraft,
            flightname:result.flight_name,
            last_service_date:result.last_service_date,
            amount:result.amount
        }
    )

    await newflight.save();

    const flightss= await flight.find();
    console.log(flightss);
    const id= newflight._id;
    res.render("arrivals.ejs",{id});
});

app.post("/:id/arrival",isLoggedIn,async(req,res)=>{

    let result=req.body;

    let{id}=req.params;

    const newarrival= new arrival(
        {

            scheduledTime:result.scheduledtime,
            arrivalTime:result.arrivaltime,
            terminal:result.terminal,
            from:result.from

        }

    );

    await newarrival.save();

    let curflight= await flight.findById(id);

    curflight.arrival= newarrival._id;

    await curflight.save();

     const flightss= await flight.find().populate("arrival");
     console.log(flightss);


    const arrivalss= await arrival.find();
    console.log(arrivalss);


    res.render("departure.ejs",{id});
});

app.post("/:id/departure",isLoggedIn,async (req,res)=>{


    let result=req.body;

    let{id}=req.params;

    const newdeparture= new departure(
        {

            scheduledDepartureTime:result.scheduledtime,
            departureTime:result.departureTime,
            terminal:result.terminal,
            destination:result.destination

        }

    );

    await newdeparture.save();

    let curflight= await flight.findById(id);

    curflight.departures= newdeparture._id;

    await curflight.save();

    const flightss = await flight.find().populate(["arrival", "departures"]);
    console.log(flightss);


    const departuress= await departure.find();
    console.log(departuress);

    res.redirect("/flights");
});


app.get("/staff",isLoggedIn,(req,res)=>{
    res.render("staff.ejs");
})

app.post("/staff",isLoggedIn, async (req,res)=>{
    
    let{staff:curstaff}=req.body;
    console.log(curstaff);

    const curflight= await flight.findOne({flightname:curstaff.FlightName}).populate(["arrival","departures","staffs"]);
    if (!curflight) {
        return res.status(404).send({ error: "Flight not found" });
    }

    const newstaff= new staff(
        {
            flightname:curstaff.FlightName,
            fullname:curstaff.fullname,
            email:curstaff.email,
            phone_number:curstaff.phone_number,
            role:curstaff.role,
            working_terminal:curstaff. working_terminal,
            shift_start_time:curstaff.shift_start_time,
            shift_end_time:curstaff.shift_end_time
        }
    );

    await newstaff.save();

    curflight.staffs.push( newstaff._id);

    await curflight.save();

    console.log(newstaff);
    console.log(curflight);
    res.redirect("/flights");
})



app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

//SIGNUP 
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.post("/signup",(async(req,res)=>{
    try{
    let {email,password,username,type}=req.body;
    const newuser=new User({email,username,type:type});
    let redistered=await User.register(newuser,password);
    req.login(redistered,(err)=>{
        if(err)
            {
                return next(err);
            }
            req.flash("success","welcome to Aero");
            res.redirect("/");
    })
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}));

//logout
app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err)
        {
            return next(err);
        }
        req.flash("success","logged out!");
        res.redirect("/");
    })
});

app.get("/mybookings",isLoggedIn,async (req,res)=>{

    const userId=req.user._id;
    console.log(userId);
    const curuser = await User.findById(userId).populate({
        path: 'bookings', // Reference the 'bookings' array in the User schema
        populate: { path: 'flight_id' }, // If you want to populate nested paths (e.g., flight_id in Booking schema)
    });

    res.render("mybooking.ejs",{curuser});
})

app.get("/:id",async (req,res)=>{

    let {id}= req.params;

    let curflight= await flight.findById(id).populate(["arrival","departures","staffs"]);
     
    console.log(curflight);



    res.render("ticket.ejs",{curflight});
});

app.get("/:id/booking",isLoggedIn,async (req,res)=>{

    let {id}=req.params;

    res.render("booking.ejs",{id});
})

app.post("/:id/booking",isLoggedIn,async (req,res)=>{

    let {id}=req.params;
    let {customer} =req.body;

    let curflight= await flight.findById(id).populate(["arrival","departures","staffs"]);
    let curuser=req.user;


    const newbooking = new booking(
        {
            flight_id:curflight._id,
            from:curflight.arrival.from,
            destination:curflight.departures.destination,
            arrivaltime:curflight.arrival.arrivalTime,
            departuretime:curflight.departures.departureTime,
            seat_number:customer.seat_number,
            terminal_no:curflight.arrival.terminal,
            amount:curflight.amount
        }
    );

     await newbooking.save();
    
    curuser.dob= customer.dob;
    curuser.fullname=customer.fullname;
    curuser.passport=customer.passport;
    curuser.phone_number=customer.phone_number;
    curuser.bookings.push(newbooking._id);

    let newuser=await curuser.save();


    console.log(newuser);
    console.log(curflight);

    // const newbooking=new 

    res.redirect("/mybookings")

});

//Error handling
app.all("*",(req,res,next)=>{
   res.send("page not found");
})

app.use((err,req,res,next)=>{
    let {status=500,message="something went wrong"}=err;
    res.status(status).send("Error Occured : "+err);
})