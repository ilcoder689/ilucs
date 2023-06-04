import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'  
import {exec} from 'child_process'

function execute(data:any) 
{
    return new Promise((resolve) => {
        let command = data['command'];
        let user = data['user_name'];
        // console.log(data);
        let res = '';
        exec(`cd build/public/${user} && ${command}`, (error, stdout, stderr) => {
            if(error) {
                // console.log("Error = ",error);
                // console.error(error);
            }
            if(stderr) {
                // console.log("Standard Error = ",stderr);
                res += stderr;
                resolve(res);   
            }
            // console.log("Stdout = ",stdout);
            res += stdout;
            // console.log("result = ",res);
            resolve(res);   
        });
    });
}

export default class CommandsController {
    public async upload(ctx: HttpContextContract) 
    {
        const file = ctx.request.file('upload_file');
        if(file) {
            await file.move(Application.tmpPath(`${ctx.session.get('user_name')}/`));
        }
        ctx.session.flash('message', 'File Uploaded Successfully');
        ctx.response.redirect('/')
    }

    public async execCommand(ctx: HttpContextContract) 
    {   
        let data = ctx.request.all();
        data['user_name'] = ctx.session.get('user_name');
        let result = await execute(data);
        // console.log(result);
        return ctx.response.send(result);
    }
}
