"use strict";


/* =========================================
   GOOGLE APPS SCRIPT API
========================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyIXvAoxY7Vmh3Rb8HdgF2CtIqm97eCoezRp1t5ql53fmotUEl6G-l-txRhoGDtskcsLg/exec";


/* =========================================
   ELEMENT
========================================= */

const pagesContainer =
    document.getElementById("pages");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");

const retryButton =
    document.getElementById("retryButton");

const backButton =
    document.getElementById("backButton");

const logoutButton =
    document.getElementById("logoutButton");

const readerStatus =
    document.getElementById("readerStatus");

const pageCounter =
    document.getElementById("pageCounter");


/* =========================================
   DATA
========================================= */

let readerData = null;

let pages = [];


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeReader
);


/* =========================================
   INITIALIZE
========================================= */

function initializeReader() {

    const savedData =
        localStorage.getItem("novelReaderData");


    /*
     * Jika login menyimpan data
     * dengan nama novelReaderData
     */

    if (savedData) {

        try {

            readerData =
                JSON.parse(savedData);

            loadReaderFromSavedData();

            return;

        } catch (error) {

            console.error(
                "Data Reader rusak:",
                error
            );

        }

    }


    /*
     * Jika belum ada data login,
     * kita tampilkan error.
     */

    showError(
        "Data login tidak ditemukan. Silakan login terlebih dahulu."
    );

}


/* =========================================
   LOAD SAVED DATA
========================================= */

function loadReaderFromSavedData() {

    if (!readerData) {

        showError(
            "Data Reader tidak tersedia."
        );

        return;

    }


    /*
     * API Anda memiliki:
     *
     * success
     * username
     * folder
     * total
     * files
     */

    if (readerData.success !== true) {

        showError(
            "Login tidak berhasil."
        );

        return;

    }


    if (
        !Array.isArray(
            readerData.files
        )
    ) {

        showError(
            "Daftar WebP tidak ditemukan."
        );

        return;

    }


    pages =
        sortPages(
            readerData.files
        );


    if (pages.length === 0) {

        showError(
            "Tidak ada halaman WebP."
        );

        return;

    }


    updateHeader();

    renderPages();

}


/* =========================================
   SORT PAGE
========================================= */

function sortPages(files) {

    return [...files].sort(
        function(a, b) {

            const numberA =
                getPageNumber(a.name);

            const numberB =
                getPageNumber(b.name);

            return numberA - numberB;

        }
    );

}


/* =========================================
   GET PAGE NUMBER
========================================= */

function getPageNumber(filename) {

    if (!filename) {
        return 0;
    }


    /*
     * Contoh:
     *
     * page-0256.webp
     *
     * hasil:
     *
     * 256
     */

    const match =
        filename.match(
            /(\d+)(?=\.[^.]+$)/
        );


    if (!match) {
        return 0;
    }


    return parseInt(
        match[1],
        10
    );

}


/* =========================================
   HEADER
========================================= */

function updateHeader() {

    const username =
        readerData.username || "";


    readerStatus.textContent =
        username
            ? "Pembaca: " + username
            : pages.length + " halaman";


    pageCounter.textContent =
        "1 / " + pages.length;

}


/* =========================================
   RENDER PAGES
========================================= */

function renderPages() {

    hideLoading();

    hideError();


    pagesContainer.innerHTML = "";


    pages.forEach(
        function(file, index) {

            createPage(
                file,
                index
            );

        }
    );


    updatePageCounter();

}


/* =========================================
   CREATE PAGE
========================================= */

function createPage(
    file,
    index
) {

    const page =
        document.createElement("div");


    page.className =
        "page";


    page.dataset.page =
        index + 1;


    const img =
        document.createElement("img");


    /*
     * API sudah memberikan URL:
     *
     * https://drive.google.com/uc?export=view&id=...
     */

    img.src =
        file.url;


    img.alt =
        file.name ||
        "Halaman " + (index + 1);


    img.loading =
        index < 3
            ? "eager"
            : "lazy";


    img.decoding =
        "async";


    /*
     * Jika gambar gagal,
     * tampilkan pesan sederhana.
     */

    img.onerror =
        function() {

            img.style.display =
                "none";


            const error =
                document.createElement(
                    "div"
                );


            error.style.padding =
                "40px 20px";


            error.style.color =
                "#aaa";


            error.textContent =
                "Gagal memuat " +
                file.name;


            page.appendChild(
                error
            );

        };


    page.appendChild(img);


    pagesContainer.appendChild(
        page
    );

}


/* =========================================
   PAGE COUNTER
========================================= */

function updatePageCounter() {

    if (!pages.length) {
        return;
    }


    const pageElements =
        document.querySelectorAll(
            ".page"
        );


    const viewportCenter =
        window.innerHeight / 2;


    let currentPage =
        1;


    let smallestDistance =
        Infinity;


    pageElements.forEach(
        function(page, index) {

            const rect =
                page.getBoundingClientRect();


            const pageCenter =
                rect.top +
                rect.height / 2;


            const distance =
                Math.abs(
                    pageCenter -
                    viewportCenter
                );


            if (
                distance <
                smallestDistance
            ) {

                smallestDistance =
                    distance;

                currentPage =
                    index + 1;

            }

        }
    );


    pageCounter.textContent =
        currentPage +
        " / " +
        pages.length;

}


/* =========================================
   SCROLL
========================================= */

let scrollTimer = null;


window.addEventListener(
    "scroll",
    function() {

        if (scrollTimer) {
            return;
        }


        scrollTimer =
            requestAnimationFrame(
                function() {

                    updatePageCounter();

                    scrollTimer = null;

                }
            );

    },
    {
        passive: true
    }
);


/* =========================================
   BACK
========================================= */

backButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "https://novelrinuxant.github.io/login/";

    }
);


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
    "click",
    function() {

        localStorage.removeItem(
            "novelReaderData"
        );


        /*
         * Jika nanti ada token,
         * bisa dihapus di sini.
         */


        window.location.href =
            "https://novelrinuxant.github.io/login/";

    }
);


/* =========================================
   RETRY
========================================= */

retryButton.addEventListener(
    "click",
    function() {

        initializeReader();

    }
);


/* =========================================
   LOADING
========================================= */

function hideLoading() {

    loading.style.display =
        "none";

}


/* =========================================
   ERROR
========================================= */

function showError(message) {

    loading.style.display =
        "none";


    pagesContainer.innerHTML =
        "";


    errorMessage.textContent =
        message;


    errorBox.hidden =
        false;

}


function hideError() {

    errorBox.hidden =
        true;

}
