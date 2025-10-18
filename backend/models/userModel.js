import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    lastLogin:{
        type: Date,
        default: Date.now
    },
    isVerified:{
        type: Boolean,
        default: false,
    }, 
    resetPasswordToken : String,
    resetPasswordExpiersAt: Date,
    verificationToken: String, 
    verificationTokenExpiersAt: Date,
    profilePicture: {
        type: String,
        default: '/uploads/profiles/profilePicture.jpg'
    },
    //admin
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
},{timestamp : true});
userSchema.statics.signup = async function(email, password, name, isAdmin) {
    // Validation
    if (!email || !password || !name) {
        throw Error('All fields must be filled');
    }

    if (!validator.isEmail(email)) {
        throw new Error("Email is not valid");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error('Password not strong enough');
    }

    const exists = await this.findOne({ email });
    if (exists) {
        throw Error('Email already used');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Assign the role based on the isAdmin parameter
    const role = isAdmin ? 'admin' : 'user';

    const user = await this.create({ email, password: hash, name, role });

    return user;
};

/*
//static signup method
userSchema.statics.signup = async function(email,password) {
    //validation 
    if(!email || !password, !name){
        throw Error('All fields must be filled');
    }
    if (!validator.isEmail(email)){
        throw new Error("Email is not valid");
        
    }
    if(!validator.isStrongPassword(password)){
        throw new Error('password not strong enough');
        
    }
    const exists = await this.findOne({ email });
    if(exists){
        throw Error('Email already used ');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt);

    const user = await this.create({ email, password: hash ,name});

    return user;

}

//static login method
userSchema.statics.login = async function(email,password) {
    //validation 
    if(!email || !password){
        throw Error('All fields must be filled');
    }
    
    const user = await this.findOne({ email });
    if(!user){
        throw Error('Incorrect Email ');
    }
    const match = await bcrypt.compare(password, user.password);

    if(!match){
        throw  Error('Incorrect password');
        
    }
    return user;

}
*/
export const User = mongoose.model("User", userSchema);