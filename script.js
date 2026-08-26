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

    showLoading();

    hideError();


    /*
     * Login menyimpan session dengan nama:
     *
     * novelReaderSession
     *
     * dan bisa berada di:
     *
     * localStorage
     * atau
     * sessionStorage
     */

    const savedSession =
        getStoredSession();


    if (!savedSession) {

        showError(
            "Data login tidak ditemukan. Silakan login terlebih dahulu."
        );

        return;

    }


    /*
     * Pastikan login benar.
     */

    if (
        savedSession.loggedIn !== true
    ) {

        showError(
            "Session login tidak valid."
        );

        return;

    }


    /*
     * Pastikan files tersedia.
     */

    if (
        !Array.isArray(
            savedSession.files
        )
    ) {

        showError(
            "Daftar WebP tidak ditemukan."
        );

        return;

    }


    /*
     * Simpan ke readerData.
     */

    readerData =
        savedSession;


    /*
     * Urutkan WebP.
     */

    pages =
        sortPages(
            readerData.files
        );


    /*
     * Pastikan ada halaman.
     */

    if (
        pages.length === 0
    ) {

        showError(
            "Tidak ada halaman WebP."
        );

        return;

    }


    /*
     * Tampilkan Reader.
     */

    updateHeader();

    renderPages();

}


/* =========================================
   GET STORED SESSION
========================================= */

function getStoredSession() {

    /*
     * Coba localStorage terlebih dahulu.
     */

    let saved =
        localStorage.getItem(
            "novelReaderSession"
        );


    /*
     * Jika tidak ada,
     * coba sessionStorage.
     */

    if (!saved) {

        saved =
            sessionStorage.getItem(
                "novelReaderSession"
            );

    }


    /*
     * Tidak ada session.
     */

    if (!saved) {

        return null;

    }


    /*
     * Parse JSON.
     */

    try {

        return JSON.parse(
            saved
        );

    } catch (error) {

        console.error(
            "Session Reader rusak:",
            error
        );


        localStorage.removeItem(
            "novelReaderSession"
        );


        sessionStorage.removeItem(
            "novelReaderSession"
        );


        return null;

    }

}


/* =========================================
   SORT PAGE
========================================= */

function sortPages(files) {

    return [...files].sort(
        function(a, b) {

            const numberA =
                getPageNumber(
                    a.name
                );


            const numberB =
                getPageNumber(
                    b.name
                );


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
        readerData.username ||
        "";


    readerStatus.textContent =
        username
            ? "Pembaca: " + username
            : pages.length + " halaman";


    pageCounter.textContent =
        "1 / " +
        pages.length;

}


/* =========================================
   RENDER PAGES
========================================= */

function renderPages() {

    hideLoading();

    hideError();


    pagesContainer.innerHTML =
        "";


    pages.forEach(
        function(file, index) {

            createPage(
                file,
                index
            );

        }
    );


    updatePageCounter();


    window.scrollTo(
        0,
        0
    );

}


/* =========================================
   CREATE PAGE
========================================= */

function createPage(
    file,
    index
) {

    const page =
        document.createElement(
            "div"
        );


    page.className =
        "page";


    page.dataset.page =
        index + 1;


    const img =
        document.createElement(
            "img"
        );


    /*
     * URL WebP yang diberikan
     * Google Apps Script.
     */

    img.src =
        file.url;


    img.alt =
        file.name ||
        "Halaman " +
        (index + 1);


    /*
     * Beberapa halaman pertama
     * langsung dimuat.
     */

    img.loading =
        index < 3
            ? "eager"
            : "lazy";


    img.decoding =
        "async";


    /*
     * Jika gambar berhasil.
     */

    img.onload =
        function() {

            console.log(
                "WebP loaded:",
                file.name
            );

        };


    /*
     * Jika gambar gagal.
     */

    img.onerror =
        function() {

            console.error(
                "Gagal memuat:",
                file.name,
                file.url
            );


            img.style.display =
                "none";


            const error =
                document.createElement(
                    "div"
                );


            error.style.padding =
                "40px 20px";


            error.style.textAlign =
                "center";


            error.style.color =
                "#aaa";


            error.textContent =
                "Gagal memuat " +
                file.name;


            page.appendChild(
                error
            );

        };


    page.appendChild(
        img
    );


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
        function(
            page,
            index
        ) {

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

let scrollTimer =
    null;


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

                    scrollTimer =
                        null;

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

if (backButton) {

    backButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "https://novelrinuxant.github.io/login/";

        }
    );

}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "novelReaderSession"
            );


            sessionStorage.removeItem(
                "novelReaderSession"
            );


            localStorage.removeItem(
                "novelReaderData"
            );


            sessionStorage.removeItem(
                "novelReaderData"
            );


            window.location.href =
                "https://novelrinuxant.github.io/login/";

        }
    );

}


/* =========================================
   RETRY
========================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function() {

            initializeReader();

        }
    );

}


/* =========================================
   LOADING
========================================= */

function showLoading() {

    if (loading) {

        loading.style.display =
            "";

    }

}


function hideLoading() {

    if (loading) {

        loading.style.display =
            "none";

    }

}


/* =========================================
   ERROR
========================================= */

function showError(message) {

    hideLoading();


    if (pagesContainer) {

        pagesContainer.innerHTML =
            "";

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

    }


    if (errorBox) {

        errorBox.hidden =
            false;

    }

}


function hideError() {

    if (errorBox) {

        errorBox.hidden =
            true;

    }

}
