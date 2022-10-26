const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export class BLEPageServices {
    constructor() {
        console.log(' >>> create ble page services');
    }

    // 1) First time coming to page.
    init() {

    }

    // 2) Called when page is reloaded.
    reload() {

    }

    // 3) Called when page is suspended to go to a child page.
    suspend() {

    }

    // 4) Called then the page is gone for good.
    destroy() {

    }
}