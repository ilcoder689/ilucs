import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import { exec } from 'child_process';

export default class SessionsController {
    static captchaMap = {};

    public async index(ctx: HttpContextContract)
    {
        if(ctx.session.get('user_name')) {
            return ctx.view.render('main');
        }

        let cpt = 0;
        for(let i=1;i<=6;i+=1)
        {
            var a = Math.floor(1 + Math.random() * 9);
            cpt = cpt*10 + a;
        }
        let captcha = JSON.stringify(cpt);

        let captchaHTML = `
        <script type="text/javascript">
            function generateCaptcha()
            {
                var canvas = document.getElementById("captcha");
                var ctx = canvas.getContext("2d");
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.beginPath();
                ctx.fillStyle = "#000000";
                ctx.fillRect(0,0,canvas.width,canvas.height);
                ctx.font = "70px Comic Sans MS";
                ctx.fillStyle = "white";
                cpt = "${captcha}";
                for(let i=1;i<=6;i+=1)
                {
                    var a = JSON.parse(cpt[i-1]);
                    var p = Math.random() * 0.2;
                    ctx.setTransform(1, p, -p, 1, 0, 0);
                    ctx.fillText(a.toString(), 20+(i-1)*40, 2*canvas.height/3);
                }
                // console.log(cpt);
                ctx.strokeStyle = "#FF0000";
                ctx.lineWidth = 8;
                ctx.moveTo(0, canvas.height/2);
                ctx.lineTo(canvas.width, canvas.height/2);
                ctx.stroke();
            }

            generateCaptcha();
        </script>`;

        SessionsController.captchaMap[ctx.session.sessionId] = captcha;
        return ctx.view.render('login', {captchaHTML: captchaHTML});
    }

    public async login(ctx: HttpContextContract)
    {
        let data = ctx.request.except(['_csrf']);
        if(SessionsController.captchaMap[ctx.session.sessionId] == data['captcha']) {
            ctx.session.put('user_name',data['user_name']);
            let res = Application.makePath(`users/${ctx.session.get('user_name')}/`);
            console.log("Path = ",res);
            exec(`mkdir ${res}`);
        }
        else {
            ctx.session.flash('error','Captcha Mismatched');
        }
        return ctx.response.redirect('/');
    }

    public async logout(ctx: HttpContextContract)
    {
        ctx.session.forget('user_name');
        return ctx.response.redirect('/');
    }
}
