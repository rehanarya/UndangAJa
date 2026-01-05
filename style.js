/**
 * 1. TAILWIND CSS CONFIGURATION
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#5D7066", 
        primaryDark: "#45544C",
        secondary: "#D4AF37", 
        surface: "#FAFAF9", 
        dark: "#1C1917",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        script: ['Great Vibes', 'cursive'],
      },
      boxShadow: {
        soft: "0 20px 40px -15px rgba(0, 0, 0, 0.05)",
        glow: "0 0 20px rgba(212, 175, 55, 0.3)",
      },
    },
  },
};

/**
 * 2. AOS ANIMATION INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      offset: 100, 
      duration: 800,
      easing: "ease-out-cubic",
    });
  }
});

/**
 * 3. SHARED FUNCTIONS
 */
function selectTheme(themeId, themeName, themeColor) {
  localStorage.setItem("selectedThemeId", themeId);
  localStorage.setItem("selectedThemeName", themeName);
  localStorage.setItem("selectedThemeColor", themeColor);
  window.location.href = "editor.html";
}

/**
 * 4. EDITOR COMPONENT (Alpine.js)
 */
function invitationEditor() {
    return {
        showPreviewMobile: false, 
        viewMode: 'desktop', 
        currentThemeId: 'botanic', 
        currentThemeName: 'Botanic Sage',
        mobileMenuOpen: false, 
        scrolled: false,       
        
        data: {
            groomNick: '', brideNick: '', groomFull: '', brideFull: '',
            date: '', timeStart: '', timeEnd: '', location: '',
            quote: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri...',
            textColor: '#D4AF37'
        },

        init() { this.loadTheme(); },

        loadTheme() {
            const storedId = localStorage.getItem('selectedThemeId');
            const storedName = localStorage.getItem('selectedThemeName');
            const storedColor = localStorage.getItem('selectedThemeColor'); 
            
            if (storedId) {
                this.currentThemeId = storedId;
                this.currentThemeName = storedName;
            }
            if (storedColor) this.data.textColor = storedColor;

            const draftData = localStorage.getItem('invitationDraft');
            if (draftData) {
                const parsed = JSON.parse(draftData);
                if (parsed.savedThemeId && parsed.savedThemeId === storedId) {
                    this.data = { ...this.data, ...parsed };
                } else {
                    this.data = { ...this.data, ...parsed, textColor: storedColor || '#D4AF37' };
                }
            }
        },

        formatDate(dateString) {
            if (!dateString) return 'Sabtu, 14 Februari 2026';
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            try { return new Date(dateString).toLocaleDateString('id-ID', options); } catch (e) { return dateString; }
        },

        publishInvitation() {
            const dataToSave = { ...this.data, savedThemeId: this.currentThemeId };
            localStorage.setItem('invitationDraft', JSON.stringify(dataToSave));
            
            Swal.fire({
                title: '<span class="font-serif font-bold text-2xl text-dark">Menyimpan Undangan</span>',
                html: '<span class="font-sans text-sm text-gray-500">Mohon tunggu, sedang memproses data...</span>',
                timer: 1500, timerProgressBar: true, allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); Swal.getPopup().style.borderRadius = '24px'; },
                customClass: { popup: 'rounded-[2rem] p-8', loader: 'border-primary', timerProgressBar: 'bg-secondary' }
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                    Swal.fire({
                        icon: 'success', iconColor: '#D4AF37',
                        title: '<span class="font-serif font-bold text-3xl text-dark">Berhasil!</span>',
                        html: '<span class="font-sans text-gray-500 mt-2 block">Undangan Anda siap untuk ditampilkan.<br>Mengalihkan ke halaman preview...</span>',
                        showConfirmButton: false, timer: 2000, timerProgressBar: true,
                        didOpen: () => { Swal.getPopup().style.borderRadius = '24px'; },
                        customClass: { popup: 'rounded-[2rem] p-8 shadow-2xl', timerProgressBar: 'bg-primary' }
                    }).then(() => { window.location.href = 'preview.html'; });
                }
            });
        }
    }
}

/**
 * 5. PREVIEW COMPONENT (Alpine.js)
 */
function previewPage() {
    return {
        mobileMenuOpen: false,
        scrolled: false,
        currentThemeId: "botanic",
        data: {
            groomNick: "Romeo", brideNick: "Juliet", groomFull: "Romeo Montague, S.T.", brideFull: "Juliet Capulet, S.Kom.",
            date: "", timeStart: "08:00", timeEnd: "11:00", location: "Grand Ballroom Hotel Indonesia",
            quote: "Dan di antara tanda-tanda kekuasaan-Nya...", textColor: "#D4AF37",
        },

        init() {
            // Re-init AOS khusus halaman preview jika diperlukan setting beda, 
            // tapi global init biasanya sudah cukup. Kita panggil loadData.
            this.loadData();
        },

        loadData() {
            const storedId = localStorage.getItem("selectedThemeId");
            if (storedId) this.currentThemeId = storedId;

            const storedColor = localStorage.getItem("selectedThemeColor");
            if (storedColor) this.data.textColor = storedColor;

            const draftData = localStorage.getItem("invitationDraft");
            if (draftData) {
                const parsed = JSON.parse(draftData);
                this.data = { ...this.data, ...parsed };
                if (!parsed.textColor && storedColor) {
                    this.data.textColor = storedColor;
                }
            }
        },

        formatDate(dateString) {
            if (!dateString) return "Sabtu, 14 Februari 2026";
            const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
            try { return new Date(dateString).toLocaleDateString("id-ID", options); } catch (e) { return dateString; }
        },

        downloadImage(elementId, filename) {
            const element = document.getElementById(elementId);
            
            Swal.fire({
                title: '<span class="font-serif font-bold text-2xl text-dark">Menyiapkan Undangan</span>',
                html: '<span class="font-sans text-sm text-gray-500">Mohon tunggu, sedang merender Undangan...</span>',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); Swal.getPopup().style.borderRadius = '24px'; },
                customClass: { popup: 'rounded-[2rem] p-8', loader: 'border-primary', timerProgressBar: 'bg-secondary' }
            });

            setTimeout(() => {
                const originalClasses = element.className;
                element.classList.remove('shadow-2xl', 'border', 'border-gray-100');
                element.scrollIntoView({ behavior: 'instant', block: 'center' });

                html2canvas(element, {
                    scale: 10, useCORS: true, backgroundColor: null,
                    logging: false, allowTaint: true, scrollY: -window.scrollY
                }).then((canvas) => {
                    const link = document.createElement("a");
                    link.download = `${filename}-${this.data.groomNick}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                    element.className = originalClasses;

                    Swal.fire({
                        icon: 'success', iconColor: '#D4AF37',
                        title: '<span class="font-serif font-bold text-3xl text-dark">Berhasil Disimpan!</span>',
                        html: '<span class="font-sans text-gray-500 mt-2 block">Gambar undangan kualitas HD telah tersimpan.</span>',
                        showConfirmButton: false, timer: 2500, timerProgressBar: true,
                        didOpen: () => { Swal.getPopup().style.borderRadius = '24px'; },
                        customClass: { popup: 'rounded-[2rem] p-8 shadow-2xl', timerProgressBar: 'bg-primary' }
                    });
                }).catch((err) => {
                    console.error(err);
                    element.className = originalClasses;
                    Swal.fire({
                        icon: 'error',
                        title: '<span class="font-serif font-bold text-xl text-dark">Gagal</span>',
                        text: 'Gagal mengunduh gambar. Silakan coba lagi.',
                        customClass: { popup: 'rounded-[2rem] p-8' }
                    });
                });
            }, 1000);
        },
    };
}