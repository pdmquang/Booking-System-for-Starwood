(function() {
    'use strict';

    angular.module('app.room', ['app.roomService', 'app.tableTrans', 'app.roomDirective', "AuthService"])
        .constant('ROOM_COMPONENTS', {
            room: "Breathe",
            default_time: {
                hours: 0,
                minutes: 0,
            },
            ROOMS: ["Breathe", "Aspire", "Moments", "Connect", "Strategy", "Tactics", "Talents", "Tribute"].sort(),
            TIMEPICKER_OPTIONS: {
                'timeFormat': 'H:i',
                'step': 15,
                'forceRoundTime': true,
                'minTime': '06:00',
                'maxTime': '21:00'
            }
        })
        .controller('RoomController', RoomController);

    RoomController.$inject = ["$scope", "$rootScope",
        "ROOM_COMPONENTS",
        "roomService", "tableService", "tableTrans", "AuthService"
    ]

    function RoomController($scope, $rootScope,
        ROOM_COMPONENTS,
        roomService, tableService, tableTrans, AuthService) {

        var self = this
        this.ROOMS = ROOM_COMPONENTS.ROOMS
        this.room = ROOM_COMPONENTS.room

        this.init = function() {
            try {
                self.selectedTicket = tableService.selectedTicket
                self.selectedTicket.userID = $rootScope.user.userID
                self.selectedTicket.room = ROOM_COMPONENTS.room;
                self.selectedTicket.title = ""
                self.selectedTicket.description = ""
                self.selectedTicket.start = ""
                self.selectedTicket.end = ""
            } catch (error){
                // console.log(error)
            }
        }

        this.selectTicket = function() {
            /*
                This function is called whenever user select any timeslots on SCHEDULE table and
                update our $scope
            */

            roomService.renderTimePicker()

            this.selectedTicket = copy(tableService.selectedTicket)
            this.readableDate = new Date(this.selectedTicket.timestamp).printCurrentDate()
            this.readOnly = roomService.isReadonly(this.selectedTicket.userID)
            this.isNewRequest = roomService.isNewRequest(this.selectedTicket.title)

        }

        /*
            HTTP calls
        */
        this.saveTicket = function() {
            /**
             Save handles calls POST method which handles:

                INSERT: for non-existing object
                UPDATE: for exisiting object in Database

             ***
             */

            // ** Jquery objects so we mannually update instead!!
            this.selectedTicket.start = $('#starttime').timepicker('getTime', "")
            this.selectedTicket.end = $('#endtime').timepicker('getTime', "")

            tableTrans.saveTicket(this.selectedTicket)
                .then(function(message) {
                    self.render();
                });
        }


        this.deleteTicket = function() {
            tableTrans.deleteTicket(this.selectedTicket)
                .then(function(message) {
                    self.render();
                });
        }

        this.render = function() {
            ROOM_COMPONENTS.room = this.room

            this.init();
            $scope.$emit("RefetchTableEvent");
        }

        $rootScope.$on("InitializeTicket", function(e) {
            self.init();
        })

        this.init();
    }

})();