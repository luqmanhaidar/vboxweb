
/* Copyright (C) 2009 Sun Microsystems, Inc.

 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

var vboxDialogs = Class.create(
{
    /*
     * This performs the initial setup work for the dialogs, like
     * loading the HTML file and inserting it into the DOM, configuring
     * the DIVs, etc. Called when the HTML loads.
     */
    initDialogs: function()
    {
        /* load the dialogs HTML file with a completion function */
        jQuery.get("/html/dialogs.html", function(data) {
            /* append the loaded HTML to the body section */
            jQuery("body").append(data);

            jQuery(function() {
                jQuery("#poweroff-dialog").dialog({
                    bgiframe: true,
                    resizable: false,
                    height: 200,
                    modal: true,
                    autoOpen: false,
                    overlay: {
                        backgroundColor: '#000',
                        opacity: 0.5
                    },
                    buttons: {
                        Ok: function() {
                            var poweroffMethod = jQuery("input[@name='poweroff-dialog-selection']:checked").val();
                            if (poweroffMethod == "savestate")
                                vbGlobal.mVirtualBox.savestateVM(vmSelWnd.curItem().id());
                            else if (poweroffMethod == "acpipoweroff")
                                vbGlobal.mVirtualBox.acpipoweroffVM(vmSelWnd.curItem().id());
                            else
                                vbGlobal.mVirtualBox.poweroffVM(vmSelWnd.curItem().id());
                            jQuery(this).dialog('close');
                        },
                        Cancel: function() {
                            jQuery(this).dialog('close');
                        }
                    }
                });
            });

            jQuery(function(){
                jQuery("#newvmdialog-ostype").buildMenu(
                {
                    menuWidth:200,
                    openOnRight:false,
                    menuSelector: ".menuContainer",
                    containment:"wrapper",
                    iconPath:"/images/vbox/",
                    hasImages:true,
                    fadeInTime:100,
                    fadeOutTime:300,
                    adjustLeft:2,
                    minZindex:"auto",
                    adjustTop:10,
                    opacity:.95,
                    shadow:true,
                    closeOnMouseOut:true,
                    closeAfter:1000
                });
            });
            jQuery(function(){
                jQuery("#newvm-form").formwizard({
                    //form wizard settings
                    historyEnabled : true,
                    formPluginEnabled: true,
                    validationEnabled : true},
                {
                   //validation settings
                },
                {
                   // form plugin settings
                }
                );
            });
            jQuery(function() {
                jQuery("#newvm-dialog").dialog({
                    bgiframe: true,
                    resizable: false,
                    height: 360,
                    width: 550,
                    modal: true,
                    autoOpen: false,
                    overlay: {
                        backgroundColor: '#000',
                        opacity: 0.5
                    }
                });
            });
        });
    },

    showNewVMWizard: function()
    {
        /*
         * Create the OS type menu. We're doing this here and not at dialog
         * loading time for several reasons. First of all, the OS type list
         * might not have been loaded from the server yet and also this is a
         * potentially time consuming task. Later, we should load the whole
         * dialog not at startup time but when called for the first time.
         */
        selectOSType = function(osTypeId)
        {
            jQuery("#ostype-selected").html(
                "<img alt=\"\" width=\"20px\" align=\"top\" style=\"padding-right: 20px;\" src=\"" +
                vbGlobal.vmGuestOSTypeIcon(osTypeId, false) + "\"/>" +
                "<span id=\"ostype-selected-id\">" +
                vbGlobal.mVirtualBox.getGuestOSTypeById(osTypeId).getDescription() +
                "</span>"
            );
        }
        var osTypes = vbGlobal.mVirtualBox.mArrGuestOSTypes;
        for (var i = 0; i < osTypes.length; i++)
        {
            /* check if the menu for the family exists */
            var submenu = jQuery("#ostype-submenu-" + osTypes[i].getFamilyId());
            if (submenu.length == 0)
            {
                /* create link to the submenu */
                jQuery("#osfamilies-span").append(
                    "<a class=\"{menu: 'ostype-submenu-" + osTypes[i].getFamilyId() + "', " +
                    "img: 'vm_start_32px.png'}\">" + osTypes[i].getFamilyId() + "</a>"
                );
                /* create the submenu */
                jQuery("#ostype_submenues").append(
                    "<div id=\"ostype-submenu-" + osTypes[i].getFamilyId() + "\" class=\"menu\">" +
                    "<span id=\"osfamily-" + osTypes[i].getFamilyId() + "-span\"></span>" +
                    "</div>"
                );
            }
            /* now add the OS entry to the right submenu, check if present to multiple calls to this method */
            if (jQuery("#ostype-entry-" + osTypes[i].getId()).length == 0)
                jQuery("#osfamily-" + osTypes[i].getFamilyId() + "-span").append(
                    "<a id=\"ostype-entry-" + osTypes[i].getId() + "\" class=\"{action: 'selectOSType(\\'" + osTypes[i].getId() + "\\')', img: '" +
                    vbGlobal.vmGuestOSTypeIcon(osTypes[i].getId(), true) +
                    "'}\">" + osTypes[i].getDescription() + "</a>"
                );
        }
        /* start with Windows XP as the default */
        selectOSType("WindowsXP");
        jQuery("#newvm-form").formwizard("reset");
        jQuery("#newvm-dialog").dialog("open");
    }

});