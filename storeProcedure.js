const mysql = require('mysql');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser());

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "college"
});


con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

    //passprotjs
    passport.serializeUser((user, done) => {
        console.log("in serialize Method");
        done(null, user)
    });
    passport.deserializeUser((user, done) => {
        console.log("in deserialize Method");
        done(null, user)
    });

    passport.use(new LocalStrategy((name, email, done) => {
        console.log(name, email);
        console.log("In use method");
        var sql = "select * from student where name='" + name + "' and email='" + email + "'";
        con.query(sql,function(err, rows) {
            if (err)
                return done(err);
            if (!rows[0]) {
                return done(null, false, {message: 'Wrong user'});
            }
            return done(null,rows);
        });
    }));

    app.post('/api/data', passport.authenticate('local', {
        successRedirect: '/ok',
        failureRedirect: '/no'
    }))

    app.get('/ok', (req, res) => {
        res.send("Ok");
    });

    app.get('/no', (req, res) => {
        res.send("No");
    });

    //student
    app.post('/api/student', (req, res) => {
        var name = req.body.name;
        var email = req.body.email;
        var city = req.body.city;
        var data = [
            name, email, city
        ];
        //var sql = "create PROCEDURE saveStudent(IN iname varchar(20),IN iemail varchar(40),IN icity varchar(20)) begin insert into student(name,email,city,display) values(iname,iemail,icity,''); end";
        var sql = "call saveStudent(?,?,?)";
        //var sql = "INSERT INTO student (name,email,city) VALUES ('" + name + "','" + email + "','" + city + "')";
        con.query(sql, data, (err, result) => {
            if (err) throw err;
            res.send("1 Record Inserted");
        });
    });

    app.get('/api/student', (req, res) => {
        //var sql = "create PROCEDURE getStudent() begin select * from student where display='' ; end";
        var sql = "call getStudent()";
        //var sql = "select * from student where display='' ";
        con.query(sql, (err, result, fields) => {
            if (err) throw err;
            res.send(result);
        });
    });

    app.delete('/api/student/:id', (req, res) => {
        var id = req.params.id;
        var data = [
            id
        ];
        var tigger = "create TRIGGER studentbackup AFTER DELETE ON student FOR EACH ROW BEGIN insert into studentbackup(name,email,city) values(old.name,old.email,old.city); END";
        //var sql = "create PROCEDURE deleteStudent(IN iid int) begin update student,marks set student.display='no',marks.display='no' where student.id = iid ; end";
        var sql = "call deleteStudent(?)";
        //var sql = "update student,marks set student.display='no',marks.display='no' where student.id = " + id;
        con.query(sql, data, (err, result) => {
            if (err) throw err;
            if(!err){
                con.query(tigger,(err) => {
                    if(err) throw err;
                    res.send("1 Record deleted");
                })
            }
        });
    });

    app.put('/api/student/:id', (req, res) => {
        var id = req.params.id;
        var name = req.body.name;
        var email = req.body.email;
        var city = req.body.city;
        var data = [
            id, name, email, city
        ];
        //var sql = "create PROCEDURE putStudent(IN iid int,IN iname varchar(20),IN iemail varchar(40),IN icity varchar(20)) begin update student set name=iname,email=iemail,city=icity where id=iid; end";
        var sql = "call putStudent(?,?,?,?)";
        //var sql = "update student set name='" + name + "',email='"+ email +"',city='" + city + "' where id = " + id;
        con.query(sql, data, (err, result) => {
            if (err) throw err;
            res.send("1 Record Updated");
        });
    });


    //Marks
    app.post('/api/marks', (req, res) => {
        var id = req.body.id;
        var subject = req.body.subject;
        var mark = req.body.mark;
        var sql = "INSERT INTO marks (id,subject,mark) VALUES ('" + id + "','" + subject + "','" + mark + "')";
        con.query(sql, (err, result) => {
            if (err) throw err;
            res.send("1 Record Inserted");
        });
    });

    app.get('/api/marks', (req, res) => {
        var sql = "select * from marks where display='' ";
        con.query(sql, (err, result, fields) => {
            if (err) throw err;
            res.send(result);
        });
    });

    app.put('/api/marks/:mid', (req, res) => {
        var mid = req.params.mid;
        var id = req.body.id;
        var subject = req.body.subject;
        var mark = req.body.mark;
        var sql = "update marks set id='" + id + "',subject='" + subject + "',mark='" + mark + "' where mid = " + mid;
        con.query(sql, (err, result) => {
            if (err) throw err;
            res.send("1 Record Updated");
        });
    });

});

app.listen(3000);
