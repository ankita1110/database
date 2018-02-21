var express=require('express')
var app=express()

var passport=require('passport')
var LocalStrateegy=require('passport-local').Strategy

var mongoose=require('mongoose')
var url="mongodb://localhost:27017/mydb";

var bodyparser=require('body-parser')
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(passport.initialize())

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user)
})

// passport.use(new LocalStrateegy((username,password,done)=>{
//     //
// })

// app.get('/login',passport.authentication('local',{
//     successRedirect:'/',
//     failureRedirect:'/err'
//     }))
app.get('/',(req,res)=>{
    res.send("sucess")
})
app.get('/err',(req,res)=>{
    res.send("error")
})

var depts=mongoose.Schema({
    id:{
        type:Number,
        require:true
    },
    name:{
        type:String,
        require:true
    }
})



var emps=mongoose.Schema({
    id:{
        type:Number,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    deptid:{
        type:Number,
        required:true
    },
    mgrid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:['empl']
    }
})

var emp=mongoose.model('empl',emps)
var dept=mongoose.model('dept',depts)

emp.aggregate([
    {
        $lookup:{
            from : "depts",
            localField : "deptid",
            foreignField : "id",
            as : "data"
        }
    }
]).then(ress => {
    for(let i = 0; i < ress.length; i ++)
    {
        console.log(ress[i])
    }
})

// db.customers.aggregate( [
//     {$match: {_id:"c1"}},
//     {$lookup: {
//         from: "orders",
//         localField: "_id",
//         foreignField: "customer_id",
//         as: "orders"}
//     }
// ] )



//for department

app.post('/deptins',(req,res)=>{
   var  newdept=new dept(req.body)
    newdept.save().then((data)=>{
      console.log(data)
       res.send(data)
    }).catch((err)=>{
       res.send(err)
    })
})

app.put('/deptupd/:id',(req,res)=> {
    var id = req.params.id
    var name = req.body.name
    dept.findById(id).then((data) => {
        data.name = name;
        data.save().then((data) => {
            console.log(data)
            res.send(data)
        }).catch((err) => {
            res.send(err)
        })
    }).catch((err) => {
        res.send(err)
    })
})

app.delete('/deptdel/:id',(req,res)=> {
    var id = req.params.id
    dept.findById(id).then((data) => {
        data.flag = 1;
        data.save().then((data) => {
            console.log(data)
            res.send(data)
        }).catch((err) => {
            res.send(err)
        })
    }).catch((err) => {
        res.send(err)
    })
})

app.get('/dept',(req,res)=> {
    dept.find().then((data) => {
            console.log(data)
            res.send(data)
        }).catch((err) => {
            res.send(err)
        })
})


app.get('/dept/:id',(req,res)=> {
    var id=req.params.id
    dept.find({id:id}).then((data) => {
        console.log(data)
        res.send(data)
    }).catch((err) => {
        res.send(err)
    })
})


//for employee

app.post('/empins',(req,res)=>{
    var  newemp=new emp(req.body)
    newemp.save().then((data)=>{
        console.log(data)
        res.send(data)
    }).catch((err)=>{
        res.send(err)
    })
})




app.put('/empupd/:id',(req,res)=> {
    var id = req.params.id
    var name = req.body.name
    var did=req.body.did
    var mgrid=req.body.mgrid
    dept.findById(id).then((data) => {
        data.name = name;
        data.deptid=did;
        data.mgrid=mgrid;
        data.save().then((data) => {
            console.log(data)
            res.send(data)
        }).catch((err) => {
            res.send(err)
        })
    }).catch((err) => {
        res.send(err)
    })
})

app.delete('/empdel/:id',(req,res)=> {
    var id = req.params.id
    dept.findOne({id: id}).then((data) => {
        data.flag = 1;
        data.save().then((data) => {
            console.log(data)
            res.send(data)
        }).catch((err) => {
            res.send(err)
        })
    }).catch((err) => {
        res.send(err)
    })
})

app.get('/emp',(req,res)=> {
    emp.find().then((data) => {
        console.log(data)
        res.send(data)
    }).catch((err) => {
        res.send(err)
    })
})


app.get('/emp/:id',(req,res)=> {
    var id=req.params.id
    emp.find({id:id}).then((data) => {
        console.log(data)
        res.send(data)
    }).catch((err) => {
        res.send(err)
    })
})

app.get('/deptemp/:id',(req,res)=> {
    var id=req.params.id
    emp.find({deptid:id}).aggregate().then((data) => {
        console.log(data)
        res.send(data)
    }).catch((err) => {
        res.send(err)
    })
})




app.listen(5000,()=>{
    console.log("server start on port 5000")
    mongoose.connect(url)
    console.log("Database connected")
})