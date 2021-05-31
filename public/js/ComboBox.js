function ComboBox(input_box , combo_box , default_value = ''){

    this.input_box = $(input_box);
    this.combo_box = $(combo_box);
    console.log(this.combo_box);

    this.final_value = '';

    this.init = ()=>{
        console.log('init');

        this.input_box.bind('input',(e)=>{
            this.combo_box.addClass('disabled');

            this.final_value = this.input_box.val().toLowerCase();

            if(this.input_box.val() === ''){
                this.combo_box.removeClass('disabled');
            }
        })
       
        Array.from(this.combo_box.children()).forEach((element , index)=>{
            console.log(element);
            //comparing combo span elements to their actual values in the database.
            if(element.innerText.toLowerCase() === default_value.toLowerCase()){
                element.classList.add('selected');
                this.final_value = default_value;
            }
            element.addEventListener('click',(e)=>{
                this.clearCombo(0);
                element.classList.add('selected');
                if(index !== 0){
                    this.final_value = element.innerHTML.toLowerCase();
                }
            })
        })
    }

    this.clearCombo = (flag)=>{
        Array.from(this.combo_box.children()).forEach((element , index)=>{
            if(index === 0 && flag){
                element.classList.add('selected');
            }
            else{
                element.classList.remove('selected');
            }
        })
    }

    

}


function checkLimit(target_string , fieldIDName , char_limit){
    let element = $('#' + fieldIDName);
    let target = $('#' + target_string);

    let rem_chars = char_limit - target.val().length;
    console.log(rem_chars);

    if(rem_chars < 0){
        target.val(target.val().slice(0,char_limit));
        element.text('Character Limit Reached');
    }
    else{
        element.text('');
    }

}
