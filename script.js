/* =========================================================
   NOVEL RINUXANT - WEBP READER V1
========================================================= */


/* =========================================================
   KONFIGURASI NOVEL
========================================================= */

const READER_CONFIG = {

    title: "Novel Reader",

    chapter: "Chapter 1",

    /*
     * Daftar halaman WebP.
     *
     * Untuk sementara gunakan URL WebP langsung.
     *
     * CONTOH:
     *
     * "https://alamat-server/001.webp"
     *
     */

    pages: [

        /*
        "https://alamat-server/001.webp",
        "https://alamat-server/002.webp",
        "https://alamat-server/003.webp",
        "https://alamat-server/004.webp"
        */

    ]

};


/* =========================================================
   STATE
========================================================= */

let currentPage = 0;


/* =========================================================
   ELEMENT
========================================================= */

const readerImage =
    document.getElementById("readerImage");

const readerViewport =
    document.getElementById("readerViewport");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const retryButton =
    document.getElementById("retryButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const pageNumber =
    document.getElementById("pageNumber");

const progress =
    document.getElementById("progress");

const thumbnailContainer =
    document.getElementById("thumbnailContainer");

const bookTitle =
    document.getElementById("bookTitle");

const chapterTitle =
    document.getElementById("chapterTitle");

const backButton =
    document.getElementById("backButton");

const fullscreenButton =
    document.getElementById("fullscreenButton");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeReader
);


function initializeReader() {

    bookTitle.textContent =
        READER_CONFIG.title;

    chapterTitle.textContent =
        READER_CONFIG.chapter;


    createThumbnails();

    updateControls();


    if (READER_CONFIG.pages.length === 0) {

        showEmptyReader();

        return;
    }


    loadPage(0);
}


/* =========================================================
   LOAD PAGE
========================================================= */

function loadPage(index) {

    if (
        index < 0 ||
        index >= READER_CONFIG.pages.length
    ) {
        return;
    }


    currentPage = index;


    hideError();

    showLoading();


    readerImage.classList.add("hidden");


    const imageURL =
        READER_CONFIG.pages[index];


    const preload =
        new Image();


    preload.onload = function () {

        readerImage.src =
            imageURL;

        readerImage.alt =
            `Halaman ${index + 1}`;

        readerImage.classList.remove(
            "hidden"
        );


        hideLoading();


        updateControls();

        updateThumbnails();

    };


    preload.onerror = function () {

        hideLoading();

        showError(
            "Halaman WebP tidak dapat dimuat."
        );

    };


    preload.src =
        imageURL;
}


/* =========================================================
   NEXT PAGE
========================================================= */

function nextPage() {

    if (
        currentPage <
        READER_CONFIG.pages.length - 1
    ) {

        loadPage(
            currentPage + 1
        );

    }

}


/* =========================================================
   PREVIOUS PAGE
========================================================= */

function previousPage() {

    if (currentPage > 0) {

        loadPage(
            currentPage - 1
        );

    }

}


/* =========================================================
   CONTROLS
========================================================= */

function updateControls() {

    const total =
        READER_CONFIG.pages.length;


    if (total === 0) {

        pageNumber.textContent =
            "0 / 0";

        progress.style.width =
            "0%";

        previousButton.disabled =
            true;

        nextButton.disabled =
            true;

        return;
    }


    pageNumber.textContent =
        `${currentPage + 1} / ${total}`;


    const percentage =
        ((currentPage + 1) / total) * 100;


    progress.style.width =
        `${percentage}%`;


    previousButton.disabled =
        currentPage === 0;


    nextButton.disabled =
        currentPage === total - 1;
}


/* =========================================================
   THUMBNAILS
========================================================= */

function createThumbnails() {

    thumbnailContainer.innerHTML =
        "";


    READER_CONFIG.pages.forEach(
        (pageURL, index) => {

            const thumbnail =
                document.createElement("button");


            thumbnail.className =
                "thumbnail";


            thumbnail.type =
                "button";


            thumbnail.setAttribute(
                "aria-label",
                `Halaman ${index + 1}`
            );


            const image =
                document.createElement("img");


            image.src =
                pageURL;


            image.alt =
                `Thumbnail halaman ${index + 1}`;


            image.loading =
                "lazy";


            thumbnail.appendChild(
                image
            );


            thumbnail.addEventListener(
                "click",
                () => {

                    loadPage(index);

                }
            );


            thumbnailContainer.appendChild(
                thumbnail
            );

        }
    );

}


/* =========================================================
   UPDATE THUMBNAILS
========================================================= */

function updateThumbnails() {

    const thumbnails =
        document.querySelectorAll(
            ".thumbnail"
        );


    thumbnails.forEach(
        (thumbnail, index) => {

            thumbnail.classList.toggle(
                "active",
                index === currentPage
            );

        }
    );


    const activeThumbnail =
        thumbnails[currentPage];


    if (activeThumbnail) {

        activeThumbnail.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
        });

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    errorText.textContent =
        message;


    errorMessage.classList.remove(
        "hidden"
    );

}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );

}


/* =========================================================
   EMPTY READER
========================================================= */

function showEmptyReader() {

    hideLoading();

    readerImage.classList.add(
        "hidden"
    );


    showError(
        "Belum ada halaman WebP yang ditambahkan."
    );

}


/* =========================================================
   RETRY
========================================================= */

retryButton.addEventListener(
    "click",
    () => {

        loadPage(currentPage);

    }
);


/* =========================================================
   BUTTON NEXT
========================================================= */

nextButton.addEventListener(
    "click",
    nextPage
);


/* =========================================================
   BUTTON PREVIOUS
========================================================= */

previousButton.addEventListener(
    "click",
    previousPage
);


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "ArrowRight") {

            nextPage();

        }


        if (event.key === "ArrowLeft") {

            previousPage();

        }

    }
);


/* =========================================================
   TOUCH / SWIPE
========================================================= */

let touchStartX = 0;
let touchStartY = 0;


readerViewport.addEventListener(
    "touchstart",
    (event) => {

        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.screenX;

        touchStartY =
            touch.screenY;

    },
    {
        passive: true
    }
);


readerViewport.addEventListener(
    "touchend",
    (event) => {

        const touch =
            event.changedTouches[0];


        const touchEndX =
            touch.screenX;

        const touchEndY =
            touch.screenY;


        const differenceX =
            touchEndX - touchStartX;


        const differenceY =
            touchEndY - touchStartY;


        /*
         * Abaikan jika gerakan lebih banyak
         * vertikal daripada horizontal.
         */

        if (
            Math.abs(differenceX) <
            Math.abs(differenceY)
        ) {
            return;
        }


        const minimumSwipe =
            50;


        if (
            differenceX <
            -minimumSwipe
        ) {

            nextPage();

        }


        if (
            differenceX >
            minimumSwipe
        ) {

            previousPage();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   FULLSCREEN
========================================================= */

fullscreenButton.addEventListener(
    "click",
    toggleFullscreen
);


async function toggleFullscreen() {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement
                .requestFullscreen();

            document.body.classList.add(
                "fullscreen-mode"
            );

        } else {

            await document.exitFullscreen();

            document.body.classList.remove(
                "fullscreen-mode"
            );

        }

    } catch (error) {

        /*
         * Beberapa browser/mobile browser
         * mungkin tidak mendukung fullscreen.
         */

        document.body.classList.toggle(
            "fullscreen-mode"
        );

    }

}


/* =========================================================
   FULLSCREEN CHANGE
========================================================= */

document.addEventListener(
    "fullscreenchange",
    () => {

        const fullscreen =
            !!document.fullscreenElement;


        document.body.classList.toggle(
            "fullscreen-mode",
            fullscreen
        );

    }
);


/* =========================================================
   BACK BUTTON
========================================================= */

backButton.addEventListener(
    "click",
    () => {

        /*
         * Untuk V1 kita kembali ke halaman login.
         */

        window.location.href =
            "https://novelrinuxant.github.io/login/";

    }
);


/* =========================================================
   PREVENT IMAGE CONTEXT MENU
========================================================= */

readerImage.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();

    }
);