'use strict'

const React = require('react')
const { Textfield } = require('react-mdl')

class Captcha extends React.Component {
    constructor(props) {
        super(props);
        this.captchaRef = React.createRef();
        this.state = {
            captchaText: "",
            captcha: "",
            isValid: false
        }
        this.setStatePromise = this.props.setStatePromise
    }
    validateCaptcha() {
        //event.preventDefault();
        let isValid = false;
        if (this.state.captchaText === this.state.captcha) {
            isValid = true;
          //alert("Valid Captcha")
        }else{
          //alert("Invalid Captcha. try Again");
          this.generateCaptcha();
        }
        return this.setStatePromise({isValid})
    }

    generateCaptcha() {
        var charsArray = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*";
        var lengthOtp = 6;
        var captcha = "";
        for (var i = 0; i < lengthOtp; i++) {
            //below code will not allow Repetition of Characters
            var index = Math.floor(Math.random() * charsArray.length); //get the next character from the array
            if (captcha.indexOf(charsArray[index]) === -1) {
                captcha = captcha.concat(charsArray[index])
            }
            else i--;
        }
        this.setState({
            captcha,
            captchaText: ""
        })
        var ctx = this.captchaRef.current.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "50px Georgia";
        ctx.strokeText(captcha, ctx.canvas.width / 2 - 80, ctx.canvas.height / 2);
    }

    captchaFunction() {
        var res = this.captchaRef.current;
    }

    componentDidMount() {
        this.generateCaptcha()
    }


    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div>
                    <canvas ref={this.captchaRef} style={{width: '200px', height: '80px' }}></canvas>    
                </div>
                <Textfield
                    onChange={(event) => this.setState({captchaText: event.target.value})}
                    label="Captcha"
                    floatingLabel
                    value={this.state.captchaText}
                    style={{width: '500px'}}
                />
            </div>
            
            
        )
    }
}

module.exports = Captcha