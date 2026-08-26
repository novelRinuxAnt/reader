"use strict";

/* =========================================================
   NOVEL RINU'XANT
   READER
   VERSION 3.0 FINAL
   GOOGLE DRIVE THUMBNAIL ENGINE
   ========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

/*
 * URL gambar Google Drive yang TERBUKTI berhasil
 * menampilkan WebP di browser.
 *
 * Jangan gunakan /uc?export=download
 */

const DRIVE_IMAGE_URL =
    "https://drive.google.com/thumbnail?id=";


/*
 * Ukuran gambar.
 *
 * w2000 = lebar maksimal 2000 pixel.
 */

const DRIVE_IMAGE_SIZE =
    "&sz=w2000";


/*
 * Halaman login.
 */

const LOGIN_URL =
    "https://novelrinuxant.github.io/login/";


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

let readerData =
    null;

let pages =
    [];


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeReader
);


/* =========================================================
   INITIALIZE READER
========================================================= */

function initializeReader() {

    console.log(
        "Novel Reader: initializing..."
    );


    /*
     * ======================================================
     * 1. Coba novelReaderSession
     * ======================================================
     */

    let savedData =
        localStorage.getItem(
            "novelReaderSession"
        );


    if (!savedData) {

        savedData =
            sessionStorage.getItem(
                "novelReaderSession"
            );

    }


    /*
     * ======================================================
     * 2. Jika tidak ada, coba novelReaderData
     * ======================================================
     */

    if (!savedData) {

        savedData =
            localStorage.getItem(
                "novelReaderData"
            );

    }


    if (!savedData) {

        savedData =
            sessionStorage.getItem(
                "novelReaderData"
            );

    }


    /*
     * ======================================================
     * Tidak ada session
     * ======================================================
     */

    if (!savedData) {

        console.error(
            "Novel Reader: session tidak ditemukan."
        );


        showError(
            "Data login tidak ditemukan. Silakan login terlebih dahulu."
        );


        return;

    }


    /*
     * ======================================================
     * PARSE JSON
     * ======================================================
     */

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


        clearSessions();


        showError(
            "Data login tidak valid. Silakan login kembali."
        );


        return;

    }


    /*
     * ======================================================
     * LOAD READER
     * ======================================================
     */

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
     * ======================================================
     * CEK LOGIN
     * ======================================================
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
     * ======================================================
     * CEK FILES
     * ======================================================
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


    if (
        readerData.files.length === 0
    ) {

        showError(
            "Tidak ada halaman WebP."
        );


        return;

    }


    /*
     * ======================================================
     * SORT
     * ======================================================
     */

    pages =
        sortPages(
            readerData.files
        );


    /*
     * ======================================================
     * CEK ID FILE
     * ======================================================
     */

    const validPages =
        pages.filter(
            function(file) {

                return (
                    file &&
                    file.id
                );

            }
        );


    if (
        validPages.length === 0
    ) {

        showError(
            "ID file WebP tidak ditemukan."
        );


        return;

    }


    /*
     * Gunakan hanya file yang
     * mempunyai ID Google Drive.
     */

    pages =
        validPages;


    console.log(
        "Novel Reader:",
        {
            username:
                readerData.username,

            total:
                pages.length
        }
    );


    /*
     * ======================================================
     * HEADER
     * ======================================================
     */

    updateHeader();


    /*
     * ======================================================
     * RENDER
     * ======================================================
 */

    renderPages();

}


/* =========================================================
   SORT PAGE
========================================================= */

function sortPages(
    files
) {

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

function getPageNumber(
    filename
) {

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
   CREATE DRIVE IMAGE URL
========================================================= */

function createDriveImageUrl(
    fileId
) {

    /*
     * ======================================================
     * URL FINAL
     *
     * https://drive.google.com/thumbnail?id=FILE_ID&sz=w2000
     * ======================================================
     */

    return (
        DRIVE_IMAGE_URL +
        encodeURIComponent(
            fileId
        ) +
        DRIVE_IMAGE_SIZE
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
                : pages.length +
                  " halaman";

    }


    if (pageCounter) {

        pageCounter.textContent =
            "1 / " +
            pages.length;

    }

}


/* =========================================================
   RENDER PAGES
========================================================= */

function renderPages() {

    hideLoading();

    hideError();


    if (!pagesContainer) {

        console.error(
            "Element #pages tidak ditemukan."
        );


        return;

    }


    /*
     * Bersihkan halaman lama.
     */

    pagesContainer.innerHTML =
        "";


    /*
     * Buat seluruh halaman.
     */

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


    /*
     * ======================================================
     * IMAGE
     * ======================================================
     */

    const img =
        document.createElement(
            "img"
        );


    /*
     * ======================================================
     * BUAT URL THUMBNAIL
     * ======================================================
     *
     * INI BAGIAN PALING PENTING.
     *
     * Tidak menggunakan:
     *
     * /uc?id=...&export=download
     *
     * Tetapi menggunakan:
     *
     * /thumbnail?id=...&sz=w2000
     *
     */

    const imageUrl =
        createDriveImageUrl(
            file.id
        );


    /*
     * Simpan URL untuk debugging.
     */

    img.dataset.driveId =
        file.id;


    img.dataset.imageUrl =
        imageUrl;


    /*
     * ======================================================
     * SRC
     * ======================================================
     */

    img.src =
        imageUrl;


    /*
     * ======================================================
     * ALT
     * ======================================================
     */

    img.alt =
        file.name ||
        "Halaman " +
        (index + 1);


    /*
     * ======================================================
     * LAZY LOADING
     * ======================================================
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


            /*
             * Setelah gambar berhasil,
             * update counter.
             */

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
                "Gagal memuat WebP:",
                {
                    name:
                        file.name,

                    id:
                        file.id,

                    url:
                        imageUrl
                }
            );


            /*
             * Jangan menggunakan file.url
             * lagi.
             *
             * Kita hanya menggunakan file.id.
             */


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
                (
                    file.name ||
                    "halaman " +
                    (index + 1)
                );


            page.appendChild(
                error
            );

        };


    /*
     * ======================================================
     * APPEND
     * ======================================================
     */

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


    if (
        !pageElements.length
    ) {

        return;

    }


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


            /*
             * Jika halaman belum punya
             * ukuran, jangan dipakai.
             */

            if (
                rect.height <= 0
            ) {

                return;

            }


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
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    function() {

        updatePageCounter();

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
                LOGIN_URL;

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

            clearSessions();


            window.location.href =
                LOGIN_URL;

        }
    );

}


/* =========================================================
   CLEAR SESSIONS
========================================================= */

function clearSessions() {

    /*
     * Session utama
     */

    localStorage.removeItem(
        "novelReaderSession"
    );


    sessionStorage.removeItem(
        "novelReaderSession"
    );


    /*
     * Session kompatibilitas
     */

    localStorage.removeItem(
        "novelReaderData"
    );


    sessionStorage.removeItem(
        "novelReaderData"
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

function showError(
    message
) {

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
