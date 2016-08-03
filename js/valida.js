var ListUnidadMedida  = "{1D3E15D7-E193-4808-ADF2-5E6CCE1BABC3}";
var ListCentroBeneficio = "{D7CB7A6B-A88B-46CE-AF7B-D6660CFF6BA2}";
var ListCondicion   = "{8A33403F-0007-47BC-A80F-0CED75234532}";
var ListDepOriginador   = "{17858D14-C9D0-44A2-8E1A-5057BD0D770D}";
var ListFormAPE     = "{B9AEFC41-FA96-4C11-917B-CE9C082B81AF}";
var ListPrueba      = "{CD48E6EA-5FA0-4FC8-9C3B-F4613AC19F47}";
var hoy = new Date();
var dialog;

    


$(document).ready(function () {

  cargaObjetos();
  cargarFormulario();

});

       
    
function cargaObjetos(){  
    
      creaSelect("unidadMedida",ListUnidadMedida,"ID","Title","ID");
      creaSelect("nomDepOri",ListDepOriginador,"ID","Title","ID");
      creaSelect("centBene",ListCentroBeneficio,"ID","Title","ID"); 
      creaSelect("condicion",ListCondicion,"ID","Title","ID");
 }
 
 function creaSelect(nomObj,nomLista,campo1,campo2,campo3){
  
    var select = $("#"+nomObj+"");
      $().SPServices({
          operation: "GetListItems",
          async: false,
          listName: nomLista,
          CAMLViewFields: "<ViewFields><FieldRef Name='"+campo1+"'></FieldRef><FieldRef Name='"+campo2+"'></FieldRef></ViewFields>",
          //CAMLQuery: "<Query><Where><Eq><FieldRef Name='Estado' /><Value Type='Text'>Activo</Value></Eq></Where><OrderBy><FieldRef Name='Orden' Ascending='True' /></OrderBy></Query>",
          completefunc: function (xData, Status) {
              select.append("<option value='0'>Seleccionar...</option>");
                  $(xData.responseXML).SPFilterNode("z:row").each(function() {   
                        //select.append("<option value='"+$(this).attr("ows_"+campo2+"")+"'>" + $(this).attr("ows_"+campo2+"") + "</option>");
                        select.append("<option value='"+$(this).attr("ows_"+campo1+"")+"'>" + $(this).attr("ows_"+campo2+"") + "</option>");
                  });
          }
      });
}
  
function registraSolicitud(){

  
  var sltnNomDepOri = $("#nomDepOri").val();
  var sltCentBene   = $("#centBene").val();
  var txtCnatidad   = $.trim($("#Cantidad").val());
  var sltUniMedida  = $('#unidadMedida').val();
  var txtDescrip    = $.trim($('#descripcion').val());
  var sltCondicion  = $('#condicion').val();
  var sltActFijo    = $('input[name="activoFijo"]:checked').val();
  var sltCentroB    = $('#centBene').val();     
  
    
/* addList(ListFormAPE,[["Title",'Formualrio APE'],["dptoOrganiza",sltnNomDepOri],["centroBeneficio",sltCentBene],
    ["cantidad",txtCnatidad],["unidMedida",sltUniMedida],["condicion", sltCondicion],["activoFijo",sltActFijo],
    ["descripcion",txtDescrip],["fecha",ConvertDateToISO(hoy)]]); */
    
   addList(ListFormAPE,[["Title",'Formualario APE'],["cantidad",txtCnatidad],
                        ["UnidadMedida",sltUniMedida],["CondicionMaterial",sltCondicion],
                        ["activoFijo",sltActFijo ],["descripcion",txtDescrip],
                        ["centroDeBeneficio",sltCentroB],["DeptOriginador",sltnNomDepOri]]);
} 

  
function addList(lista,datos){  
  $().SPServices({
        operation: "UpdateListItems",
        async: false,
        batchCmd: "New",
        listName: lista,
        valuepairs: datos,
        completefunc: function(xData, Status) { 
     /*   if(Status== "success")
          {
          alert('SI');
          alert(datos);
          }else{
          alert('NO');
          } */
        }
     });
    
} 

function cantidadValido(){
        var correct = true;
        var cant = $('#Cantidad').val();
        if(cant == 0){
            correct = false;
        }
        return correct;
}

function validaForm(){

    var correct   = true;
    var cantidad  = $('#Cantidad').val();
    var uniMedida = $('#unidadMedida').val();
    var condicion = $('#condicion').val();
    var descrip   = $('#descripcion').val();
    var dptOrga   = $('#nomDepOri').val();
    var CentBene  = $("#centBene").val();

    

  if((cantidad =='0')||(uniMedida =='0')||(condicion =='0')||(descrip =='')||(dptOrga=='0')||(CentBene=='0')){
    var correct = false;
    alert("Llene todos los campos");
  }
  return correct;
}


function cargarFormulario(){

 $( "#btnAdd" ).button().on( "click", function() {
      dialog.dialog( "open" );
    });
    
 dialog = $( "#tableMateriales" ).dialog({
      autoOpen: false,
      height: 230,
      width: 570,
      modal: true,
      buttons: {
        "Agregar": function(){
          if(validaForm()){
              if(cantidadValido()){
                 addUser();
                 dialog.dialog("close");
              }else{
                    alert("Cantidad tiene que ser mayor a cero");
                }
            }
          },
        Cancelar: function() {
          dialog.dialog( "close" );
           }
      },
      close: function(){
       dialog.dialog( "close" );
      }
    });

    
$('.solo-numero').keyup(function (){
     this.value = (this.value + '').replace(/[^0-9]/g, '');
});


document.getElementById('fchFecha').innerText = moment(hoy).format('DD/MM/YYYY');

//$("#fchFecha").val(moment(hoy).format('DD/MM/YYYY'));

$("#descripcion").keyup(function(){
    el = $(this);
    if(el.val().length >= 1500){
        el.val( el.val().substr(0, 1500) );
    } else {
        $("#charNum").text("Le quedan " +(1500-el.val().length)+" caracteres");
    }
});

$('#buttonEnviar').hide();
}


 function addUser() {    
    registraSolicitud();
    dialog.dialog( "close" );
    consultaActividades();
  }

function consultaActividades(){
$('#tableGrid td').parent().remove();

var ini    = "2016-000-00";
var contador = 1;
  $().SPServices({
    operation: "GetListItems",
    async: false,
    listName: ListFormAPE,
    CAMLViewFields: "<ViewFields>" +
              "<FieldRef Name='ID' />"+
              "<FieldRef Name='cantidad' />"+
              "<FieldRef Name='CondicionMaterial' />"+
            //  "<FieldRef Name='centroDeBeneficio' />"+
            //  "<FieldRef Name='DeptOriginador' />"+
              "<FieldRef Name='activoFijo' />"+
              "<FieldRef Name='descripcion' />"+  
              "<FieldRef Name='UnidadMedida' />"+                                                                                         
              "</ViewFields>",
    //CAMLQuery: "<Query><Where><Eq><FieldRef Name='ID_x0020_Minuta' /><Value Type='Text'>" + 30 + "</Value></Eq></Where></Query>",
    completefunc: function (xData, Status) {
      $(xData.responseXML).SPFilterNode("z:row").each(function() {
      
      var ID        = $(this).attr("ows_ID");
          var cantidad  = $(this).attr("ows_cantidad");
          var condicion   = $(this).attr("ows_CondicionMaterial").split('#')[1];

      //    var condicion   = $(this).attr("ows_centroDeBeneficio").split('#')[1];
          
          var activoFijo  = $(this).attr("ows_activoFijo");
          var descripcion = $(this).attr("ows_descripcion");      
          var uniMedida   = $(this).attr("ows_UnidadMedida").split('#')[1];;
          var cantidad1   = cantidad.split(".")[0];  
                 
          
              $("#tableGrid").append("<tr align='middle'>" +
               "<td align='left' style='border-style:solid'>"+contador+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+cantidad1+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+uniMedida+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+descripcion+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+condicion+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+activoFijo+"</a></td>" +                                              
               '<td align="left" style="border-style:solid;text-align: center;"><a id="ModificarUser" href="javascript:ModList('+ID+');"><img src="../SiteAssets/img/editar.png" /></a></td>' +                           
               '<td align="left" style="border-style:solid;text-align: center;"><a id="myLink" href="javascript:dleList('+ID+');"><img src="../SiteAssets/img/eliminar.png" /></a></td>' +            
                   "</tr>");  
              contador=contador+1;    
      }); 
      //var ItemCount = $(xData.responseXML).SPFilterNode("rs:data").attr("ItemCount");
  /*    if(ItemCount==0){
         $("#myHTMLTable").append("<tr align='middle'>" +
               "<td align='Middle' colspan='7'>Minuta sin Participantes</td>" +                           
                   "</tr>");  
      } */
                
    }
  }); 
  $("#grid ").hide();
  $("#grid ").fadeIn(2000);
  $('#button').show();
}

function dleList(id){
    $( "#dialog-confirm" ).dialog({
      resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "OK": function() {
        },
        Cancelar: function() {
          $( this ).dialog( "close" );
        }
      }
    });
}

function cleanList(){


}

function ModList(id){}

function ConvertDateToISO(dtDate){
//*************************************************
//Converts Javascript dtDate to ISO 8601 standard for compatibility with SharePoint lists
//Inputs: dtDate = Javascript date format (optional)
//*************************************************
//alert("InISOCOnversion");
  var d;
  if (dtDate != null)  {
     //Date value supplied
     
     d = new Date(dtDate);
  }
  else  {
     //No date supplied, Create new date object
     d = new Date();
  }
  //Generate ISO 8601 date/time formatted string
  var s = "";
  //alert(d.getFullYear());
  if(d.getFullYear)
  {
  //alert("FullYear");
         s += d.getFullYear() + "-";
    }
    else
    {
    //alert("getyear");
    var year= d.getYear() + 1900;
    s += year + "-";
        
    }
  //s += d.getYear() + "-";
  s += d.getMonth() + 1 + "-";
  s += d.getDate();
  s += "T" + d.getHours() + ":";
  s += d.getMinutes() + ":";
  //Replace the "Z" below with the required
  //time zone offset (eg "+10:00" - Australian EST)
  s += d.getSeconds() + "Z";
  //Return the ISO8601 date string
  return s;
}


