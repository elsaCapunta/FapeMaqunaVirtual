var ListUnidadMedida  = "{1D3E15D7-E193-4808-ADF2-5E6CCE1BABC3}";
var ListCentroBeneficio = "{D7CB7A6B-A88B-46CE-AF7B-D6660CFF6BA2}";
var ListCondicion   = "{8A33403F-0007-47BC-A80F-0CED75234532}";
var ListDepOriginador   = "{17858D14-C9D0-44A2-8E1A-5057BD0D770D}";
var ListFormAPE     = "{B9AEFC41-FA96-4C11-917B-CE9C082B81AF}";
var ListMateriales    = "{B67FCB46-7DB7-46A2-B2B6-D18FFEC84756}";
var hoy = new Date();
var dialog;
var correlativo = "2016-000";
var FapeID = 0;
var FapeAux = 0;
var contador = 1;


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
  

function registrarEncabezado(){
  var sltCentroB    = $("#centBene").val();
  var sltNomDepOri  = $("#nomDepOri").val();
  
  addList(ListFormAPE,[["Title",correlativo],["centroDeBeneficio",sltCentroB],
             ["depOrganizador",sltNomDepOri],["Fecha",ConvertDateToISO(hoy)]]);
  
  }
  
  
function registrarMateriales(){
  var txtCnatidad   = $.trim($("#Cantidad").val());
  var sltUniMedida  = $('#unidadMedida').val();
  var txtDescrip    = $.trim($('#descripcion').val());
  var sltCondicion  = $('#condicion').val();
  var sltActFijo    = $('input[name="activoFijo"]:checked').val();
   
    addList(ListMateriales,[["Title",txtDescrip],["Cantidad",txtCnatidad],
                ["Condicion",sltCondicion],["unidadMedida", sltUniMedida],
                ["activoFijo",sltActFijo],["correlativoFAPE",FapeAux],
                ["correlativoMaterial",contador]]);           

}

  
function addList(lista,datos){  
contador = 1;
  $().SPServices({
        operation: "UpdateListItems",
        async: false,
        batchCmd: "New",
        listName: lista,
        valuepairs: datos,
        completefunc: function(xData, Status) { 
        FapeID = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
        
        
  /*      alert(FapeID);
        if(Status== "success")
          {
          alert('SI');
          alert(datos);
          }else{
          alert('NO');
          } */
        }
     });
    
} 

function ModificarCorrelativoMaterial(IdUpdate, GuidLista, datos){
  
    $().SPServices({ async:false,
                     operation:"UpdateListItems",
                     listName:GuidLista,
                     valuepairs: datos,
                     //batchCmd:"Delete",
                    // CAMLQuery:CQ,
                     ID:IdUpdate,
                     completefunc: function (xData, Status) {
                                                               
                                  }
                  });
}
  


function ActualizaCorrelativosMaterialTodos(){
$('#tableGrid td').parent().remove();

var cm = 1;
  $().SPServices({
    operation: "GetListItems",
    async: false,
    listName: ListMateriales,
        completefunc: function (xData, Status) {
      $(xData.responseXML).SPFilterNode("z:row").each(function() {
      
        ModificarCorrelativoMaterial($(this).attr("ows_ID"),ListMateriales,[["correlativoMaterial",cm]]);
        cm =cm +1;
      }); 
                
    }
  }); 
  
}


function EliminarMaterial(id){

  $( "#dialog-confirm" ).dialog({
      resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "OK": function() {
            $().SPServices({
          operation: "UpdateListItems",
          async: false,
          batchCmd: "Delete",
          listName: ListMateriales,
      ID: id,        
          completefunc: function(xData, Status) {
          }
      });
          $( this ).dialog( "close" );
          contador=1;
          ActualizaCorrelativosMaterialTodos();
          consultarMateriales();
        },
        Cancelar: function() {
          $( this ).dialog( "close" );
        }
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
   
 create: function(event, ui) { 
    $('.ui-dialog-titlebar-close').hide();
    
 }, 
    
  /*  create: function(event, ui) { 
    var widget = $(this).dialog("widget");
    $(".ui-dialog-titlebar-close").removeClass("ui-icon-closethick").addClass("ui-icon-minusthick"); */
   

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
           $('#formApe')[0].reset();
           

      },
        Cancelar: function() {
          dialog.dialog( "close" );
           $('#formApe')[0].reset();
           

           }
      },
      close: function(){
       dialog.dialog( "close" );
       $('#formApe')[0].reset();
      
      }
    });
    
$('.solo-numero').keyup(function (){
     this.value = (this.value + '').replace(/[^0-9]/g, '');
});


document.getElementById('fchFecha').innerText = moment(hoy).format('DD/MM/YYYY');
document.getElementById('apeN').innerText = correlativo;

//$("#fchFecha").val(moment(hoy).format('DD/MM/YYYY'));

$("#descripcion").keyup(function(){
    el = $(this);
    if(el.val().length >= 1500){
        el.val( el.val().substr(0, 1500) );
    } else {
        $("#charNum").text("Le quedan " +(1500-el.val().length)+" caracteres");
    }
});



$('#btnEnviar').hide();
}



 function addUser() {   
 
  if(FapeID == 0){
  
    registrarEncabezado();
    FapeAux = FapeID;
    registrarMateriales();
    dialog.dialog( "close" );
    consultarMateriales();
    
   }else{
    
    registrarMateriales();
    dialog.dialog( "close" );
    consultarMateriales();

  } 
}

function consultarMateriales(){
$('#tableGrid td').parent().remove();

//var CQ = "<Query><OrderBy><FieldRef Name='ID' Ascending='True'/></OrderBy></Query>";

var ini    = "2016-000-00";

  $().SPServices({
    operation: "GetListItems",
    async: false,
    listName: ListMateriales,
    
    CAMLViewFields: "<ViewFields>" +
              "<FieldRef Name='ID' />"+
              "<FieldRef Name='Title' />"+
              "<FieldRef Name='Cantidad' />"+
              "<FieldRef Name='Condicion' />"+
              "<FieldRef Name='unidadMedida' />"+ 
              "<FieldRef Name='activoFijo' />"+
              "<FieldRef Name='correlativoMaterial' />"+
              "</ViewFields>",
    CAMLQuery: "<Query><OrderBy><FieldRef Name='correlativoMaterial' Ascending='True'/></OrderBy></Query>",
    completefunc: function (xData, Status) {
      $(xData.responseXML).SPFilterNode("z:row").each(function() {
      
      var ID          = $(this).attr("ows_ID");
          var cantidad    = $(this).attr("ows_Cantidad");
          var activoFijo    = $(this).attr("ows_activoFijo");
          var descripcion   = $(this).attr("ows_Title");
          var correMateriales1= $(this).attr("ows_correlativoMaterial");
          var correMateriales = correMateriales1.split(".")[0]

          
          var umeroCaracteres = correMateriales.length; 
          
      if( ($(this).attr("ows_Condicion")) && ($(this).attr("ows_unidadMedida")) && (cantidad)){
        var condicion   = $(this).attr("ows_Condicion").split('#')[1];
        var uniMedida   = $(this).attr("ows_unidadMedida").split('#')[1];
        var cantidad1   = cantidad.split(".")[0];     
         } 
         
          if(umeroCaracteres == 1){
                correMateriales = "00"+correMateriales;
              }else{
               correMateriales = "0"+correMateriales;
              }
         
                 
          
              $("#tableGrid").append("<tr align='middle'>" +
               "<td align='left' style='border-style:solid'>"+correMateriales+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+cantidad1+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+uniMedida+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+descripcion+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+condicion+"</a></td>" + 
               "<td align='left' style='border-style:solid'>"+activoFijo+"</a></td>" +                                              
               '<td align="left" style="border-style:solid;text-align: center;"><a id="ModificarUser" href="javascript:ModList('+ID+');"><img src="../SiteAssets/img/editar.png" /></a></td>' +                           
               '<td align="left" style="border-style:solid;text-align: center;"><a id="myLink" href="javascript:EliminarMaterial('+ID+');"><img src="../SiteAssets/img/eliminar.png" /></a></td>' +            
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
  $('#btnEnviar').show();
  
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

function Guardar(){
  var dptOrga   = $('#nomDepOri').val();
  var CentBene  = $("#centBene").val();

  if(dptOrga == '0'){
    alert("Seleccione un Departamento originador");
  }else{
     if(CentBene == '0'){
    alert("Seleccione un centro de beneficio");
    }else{
    
    registrarEncabezado();
    $('#nomDepOri').val('0');
    $('#centBene').val('0');
   
    }
    
  }
}



