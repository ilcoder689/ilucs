$(document).ready(function () {
    $('#maximize').click(function(){
        $('#terminal').attr('style','');
        $('#terminal').toggleClass('w-full');
        $('#terminal').toggleClass('w-6/12');
        $('#terminal').toggleClass('h-full');
        $('#terminal').toggleClass('h-3/6');
        if($('#terminal').hasClass('h-full')){
            // console.log('Change to Restore');
            $(this).html('&#10697;');
        }
        else {
            // console.log('Change to maximize');
            $(this).html('&#9634;');
        }
    });

    $('#close').click(function() {
        location.href = 'logout';
    });

    $('#upload_file').click(function() {
        $('#upload_input').click();
    });

    $('#upload_input').on('change',function(e) {
        $('#uploadForm').submit();
    });

    function setBlinkLeft() 
    {
        let leftVal = $('#terminal_command_left').text();
        let rightVal = $('#terminal_command_right').text();
        if(leftVal) {
            $('#terminal_command_right').text(leftVal[leftVal.length - 1] + rightVal);
            $('#terminal_command_left').text(leftVal.slice(0,-1));
        }
    }

    function setBlinkRight() 
    {
        let leftVal = $('#terminal_command_left').text();
        let rightVal = $('#terminal_command_right').text();
        if(rightVal) {
            $('#terminal_command_left').text(leftVal + rightVal[0]);
            $('#terminal_command_right').text(rightVal.slice(1));
        }
    }

    function addCharLeft(ch)
    {
        let leftVal = $('#terminal_command_left').text();
        $('#terminal_command_left').text(leftVal + ch);
    }

    function deleteCharLeft()
    {
        let leftVal = $('#terminal_command_left').text();
        $('#terminal_command_left').text(leftVal.slice(0,-1));
    }

    function deleteCharRight()
    {
        let rightVal = $('#terminal_command_right').text();
        $('#terminal_command_right').text(rightVal.slice(1));
    }

    function sanitizeHTML(text) {
        var element = document.createElement('div');
        element.innerText = text;
        var result = element.innerHTML;
        return result;
    }

    $('#terminal_content_input').on('keyup', function(ev) {
        ev = ev.originalEvent;
        // console.log(ev.key);
        if(ev.key == 'ArrowLeft') {
            setBlinkLeft();
        }
        else if(ev.key == 'ArrowRight') {
            setBlinkRight();
        }
        else if(ev.key == 'Backspace'){
            deleteCharLeft();
        }
        else if(ev.key == 'Delete') {
            deleteCharRight();
        }
        else if(ev.key == 'Enter') {
            let html = $("#terminal_content_static").html();
            let data1 = $("#terminal_command_left").text();
            let data2 = $("#terminal_command_right").text();
            let data3 = $("#terminal_initial").html();
            let csrf = $("#terminal_command input[name='_csrf']").val()
            let command = `${data1}${data2}`;

            // console.log("Command = ",command);
            // console.log(csrf);
            $('#terminal_content_input').attr('disabled',true);    
            //send to server and receive result
            fetch("/execute", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({ '_csrf': csrf, command:command, a: 1, b: 2 })
            })
                .then(function(res) {return res.text()})
                .then(function (res) { 
                    res = sanitizeHTML(res);
                    command = sanitizeHTML(command);
                    // console.log(res); 
                    $('#terminal_content_input').attr('disabled',false);
                    html += `<div class='terminal_initial'>${data3}</div>`
                    html += `<div class='inline'>${command}</div>`;
                    html += `<pre>${res}</pre>`;
                    $("#terminal_content_static").html(html);
                    if(command.trim().toLowerCase() == 'clear')
                    {
                        $("#terminal_content_static").html('');
                    }
                    $("#terminal_command_left").html('');
                    $("#terminal_command_right").html('');
                    $('#terminal_content').animate({scrollTop: $('#terminal_content').prop("scrollHeight")},1000);
                    $('#terminal_content_input').focus();
                })
                .catch(function (res) { console.log(res) })

            // $.ajaxSetup({
            //     headers:{
            //         'Content-Type': 'application/json'
            //     }
            // });
            // $.post('/execute', JSON.stringify({ '_csrf': csrf, command:'dir', a: 1, b: 2 }),(data,status)=>{
            //     console.log(data, status);
            // });
        }
    });

    $('#terminal_content_input').on('input', function(ev) {
        ev = ev.originalEvent;
        let ch = $('#terminal_content_input').val();
        // console.log('CH = ',ch);
        if(ch) {
            // console.log("Char added");
            addCharLeft(ch[ch.length-1]);
            // console.log($("#terminal_command_left").text(), $("#terminal_command_right").text());
        }
        $('#terminal_content_input').val('');
        $('#terminal_content_input').focus();
    });

    $("#terminal_content").click(function(){
        $('#terminal_content_input').focus();
    });

    setInterval(function(){
        if($('#terminal_content_input').is(':focus')) {
            $('#blink').toggle();
        }
        else {
            $('#blink').hide();
        }
    }, 500);

     /** Footer Dynamic Content */
     $('#footer').html(`&copy; Copyright ${new Date().getFullYear()} Piyush Garg`);
});