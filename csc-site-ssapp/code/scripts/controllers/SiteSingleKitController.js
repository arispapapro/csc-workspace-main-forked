const { WebcController } = WebCardinal.controllers;
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const viewModelResolver = cscServices.viewModelResolver;
const { shipmentStatusesEnum, shipmentPendingActionEnum } = cscServices.constants.shipment;
const momentService = cscServices.momentService;
const { Commons } = cscServices.constants;

class SiteSingleKitController extends WebcController {

    constructor(...props) {
        super(...props);

        this.kitsService = new KitsService(this.DSUStorage);
        this.initViewModel();
        this.openFirstAccordion();
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.toggleAccordionItemHandler();
        this.onTagClick('manage-kit', () => {
        });
    }

    async initViewModel() {
        this.model = viewModelResolver('kit');
        let { keySSI } = this.history.location.state;
        this.model.keySSI = keySSI;
        let kit = await this.kitsService.getKitDetails(this.model.keySSI);
        kit = { ...this.transformKitData(kit) };
        this.model.kit = kit;
        if (this.model.kit.shipmentComments) {
            this.model.allComments = this.getShipmentComments(this.model.kit);
            console.log("Shipment Comments 1", JSON.stringify(this.model.kit.shipmentComments));
          }
          else {
            this.model.allComments = JSON.parse(JSON.stringify());
          }
        console.log("Kit Details", JSON.stringify(this.model.kit));
    }

    getShipmentComments(kit){
        console.log("Shipment Comments 2", JSON.stringify(kit.shipmentComments));
        let comments = kit.shipmentComments;
        console.log("Shipment Comments 3", JSON.stringify(comments));
        comments.forEach((comment) => {
          comment.date = momentService(comment.date).format(Commons.DateTimeFormatPattern);
        });
        return comments;
      }

    getDateTime(timestamp) {
        return {
            date: momentService(timestamp).format(Commons.YMDDateTimeFormatPattern),
            time: momentService(timestamp).format(Commons.HourFormatPattern)
        };
    }

    transformKitData(data) {
        if (data) {
            data.status_value = data.status.sort((function (a, b) {
                return new Date(b.date) - new Date(a.date);
            }))[0].status;

            if (data.status_value === shipmentStatusesEnum.Received) {
                data.status_value = shipmentStatusesEnum.Received;
            }

            data.status_date = momentService(data.status.sort((function (a, b) {
                return new Date(b.date) - new Date(a.date);
            }))[0].date).format(Commons.DateTimeFormatPattern);

            if (data.receivedDateTime) {
                data.receivedDateTime = this.getDateTime(data.receivedDateTime)
            }

            data.pending_action = this.getPendingAction(data.status_value);

            // if (data.shipmentComments) {
            //     data.shipmentComments.forEach((comment) => {
            //       comment.date = momentService(comment.date).format(Commons.DateTimeFormatPattern);
            //     });
            //   }

            return data;
        }

        return {};
    }

    getPendingAction(status_value) {
        switch (status_value) {
          case shipmentStatusesEnum.Received:
            return shipmentPendingActionEnum.ManageKits;
        }
    
        return '-';
      }

      toggleAccordionItemHandler() {
        this.onTagEvent('toggle-accordion', 'click', (model, target) => {
          const targetIcon = target.querySelector('.accordion-icon');
          target.classList.toggle('accordion-item-active');
          targetIcon.classList.toggle('rotate-icon');
    
          const panel = target.nextElementSibling;
          if (panel.style.maxHeight === '1000px') {
            panel.style.maxHeight = '0px';
          } else {
            panel.style.maxHeight = '1000px';
          }
        });
      }

      openFirstAccordion() {
        const accordion = this.querySelector('.accordion-item');
        const targetIcon = accordion.querySelector('.accordion-icon');
        const panel = accordion.nextElementSibling;
    
        accordion.classList.toggle('accordion-item-active');
        targetIcon.classList.toggle('rotate-icon');
        panel.style.maxHeight = '1000px';
      }


}
export default SiteSingleKitController;