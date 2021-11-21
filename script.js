
var a = 1;

function show_hide(){
    if (a==1){
        document.getElementById("account_preference").style.display="inline";
        document.getElementById("overlay").style.display="inline";
        return a=0;
    }

    else{
        document.getElementById("account_preference").style.display="none";
        document.getElementById("overlay").style.display="none";
        return a=1;
    }
}

function show_hide_notif(){
    if (a==1){
        document.getElementById("notification").style.display="inline";
        document.getElementById("overlay").style.display="inline";
        return a=0;
    }

    else{
        document.getElementById("notification").style.display="none";
        document.getElementById("overlay").style.display="none";
        return a=1;
    }
}


function add_class_button(){
    if (a==1){
        document.getElementById("add_checklist").style.display="inline";
        document.getElementById("overlay").style.display="inline";
        return a=0;
    }

    else{
        document.getElementById("add_checklist").style.display="none";
        document.getElementById("overlay").style.display="none";
        return a=1;
    }
}