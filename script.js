"use strict";

/* =========================================================
   NOVEL RINU'XANT
   READER
   VERSION 2.0
   ========================================================= */


/* =========================================================
   ELEMENT
========================================================= */

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


/* =========================================================
   DATA
========================================================= */

let readerData = null;

let pages = [];


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeReader
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeReader() {

    /*
     * Login Anda sekarang menyimpan:
     *
     * novelReaderSession
     */

    const localSession =
        localStorage.getItem(
            "novelReaderSession"
        );


    const sessionSession =
        sessionStorage.getItem(
            "novelReaderSession"
        );


    /*
     * Prioritaskan localStorage.
     */

    const savedData =
        localSession ||
        sessionSession;


    if (!savedData) {

        showError(
            "Data login tidak ditemukan. Silakan login terlebih dahulu."
        );

        return;

    }


    try {

        readerData =
            JSON.parse(
                savedData
            );


    } catch (error) {

        console.error(
            "Session Reader rusak:",
            error
        );


        showError(
            "Data login tidak valid. Silakan login kembali."
        );


        return;

    }


    loadReader();


}


/* =========================================================
   LOAD READER
========================================================= */

function loadReader() {

    if (!readerData) {

        showError(
            "Data Reader tidak tersedia."
        );

        return;

    }


    /*
     * Pastikan login valid.
     */

    if (
        readerData.loggedIn !== true
    ) {

        showError(
            "Sesi login tidak valid."
        );

        return;

    }


    /*
     * Pastikan files tersedia.
     */

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


    /*
     * Pastikan ada halaman.
     */

    if (
        readerData.files.length === 0
    ) {

        showError(
            "Tidak ada halaman WebP."
        );

        return;

    }


    /*
     * Sort halaman.
     */

    pages =
        sortPages(
            readerData.files
        );


    /*
     * Update header.
     */

    updateHeader();


    /*
     * Tampilkan WebP.
     */

    renderPages();

}


/* =========================================================
   SORT PAGE
========================================================= */

function sortPages(files) {

    return [...files].sort(
        function(a, b) {

            return (
                getPageNumber(a.name) -
                getPageNumber(b.name)
            );

        }
    );

}


/* =========================================================
   GET PAGE NUMBER
========================================================= */

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


/* =========================================================
   HEADER
========================================================= */

function updateHeader() {

    if (readerStatus) {

        const username =
            readerData.username || "";


        readerStatus.textContent =
            username
                ? "Pembaca: " + username
                : pages.length + " halaman";

    }


    if (pageCounter) {

        pageCounter.textContent =
            "1 / " + pages.length;

    }

}


/* =========================================================
   RENDER PAGES
========================================================= */

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

}


/* =========================================================
   CREATE PAGE
========================================================= */

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
     * ======================================================
     * URL DARI GOOGLE APPS SCRIPT
     * ======================================================
     *
     * Contoh:
     *
     * https://drive.google.com/uc?
     * id=XXXX
     * &export=download
     *
     * Jangan membuat URL Drive sendiri.
     *
     * Gunakan URL yang diberikan GS.
     */

    img.src =
        file.url;


    img.alt =
        file.name ||
        "Halaman " +
        (index + 1);


    /*
     * 3 halaman pertama
     * dimuat langsung.
     *
     * Sisanya lazy loading.
     */

    img.loading =
        index < 3
            ? "eager"
            : "lazy";


    img.decoding =
        "async";


    /*
     * ======================================================
     * SUCCESS
     * ======================================================
     */

    img.onload =
        function() {

            page.classList.add(
                "loaded"
            );

            updatePageCounter();

        };


    /*
     * ======================================================
     * ERROR
     * ======================================================
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


            error.className =
                "page-error";


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


/* =========================================================
   PAGE COUNTER
========================================================= */

function updatePageCounter() {

    if (
        !pages.length ||
        !pageCounter
    ) {

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


/* =========================================================
   SCROLL
========================================================= */

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


/* =========================================================
   BACK
========================================================= */

if (backButton) {

    backButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "https://novelrinuxant.github.io/login/";

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

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


            window.location.href =
                "https://novelrinuxant.github.io/login/";

        }
    );

}


/* =========================================================
   RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function() {

            initializeReader();

        }
    );

}


/* =========================================================
   LOADING
========================================================= */

function hideLoading() {

    if (loading) {

        loading.style.display =
            "none";

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    if (loading) {

        loading.style.display =
            "none";

    }


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


/* =========================================================
   HIDE ERROR
========================================================= */

function hideError() {

    if (errorBox) {

        errorBox.hidden =
            true;

    }

}
