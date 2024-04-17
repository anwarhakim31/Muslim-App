const waktuShubuh = document.querySelector(".waktu-shubuh");
const waktuDzuhur = document.querySelector(".waktu-dzuhur");
const waktuAshar = document.querySelector(".waktu-ashar");
const waktuMagrib = document.querySelector(".waktu-magrib");
const waktuIsya = document.querySelector(".waktu-isya");

const waktuSholat = {
  subuh: 0,
  dzuhur: 0,
  ashar: 0,
  maghrib: 0,
  isya: 0,
  shubuh: 0,
};

const tanggals = new Date();
const newtanggal = tanggals.toLocaleDateString().split("/");
let b = newtanggal[1];
let h = newtanggal[0];
let t = newtanggal[2];
let next;
let bnext;
async function getDataWaktuSholat() {
  let totalHari = new Date(t, b, 0).getDate();

  next = parseFloat(h, 10) + 1;
  bnext = b;

  if (next > totalHari) {
    next = nol(1);
    bnext = parseFloat(b, 10) + 1;
  } else if (h === 1) {
    next = parseFloat(h, 10) + 1;
    bnext = b;
  }

  h = nol(h);
  b = nol(b);

  try {
    const response = await fetch(
      `https://api.myquran.com/v2/sholat/jadwal/1204/${t}/${b}/${h}`
    );
    const res = await fetch(
      `https://api.myquran.com/v2/sholat/jadwal/1204/${t}/${bnext}/${next}`
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data waktu sholat");
    }
    let data = await response.json();
    let nextdata = await res.json();

    let data1 = data.data.jadwal;

    let data2 = nextdata.data.jadwal;

    let newObj = {};

    for (const obj in data1) {
      if (
        obj === "subuh" ||
        obj === "dzuhur" ||
        obj === "ashar" ||
        obj === "maghrib" ||
        obj === "isya"
      ) {
        newObj[obj] = data1[obj];
      }
    }
    const nilaishubuh = data2.subuh;

    const jamsubuh = nilaishubuh.split(":")[0];
    const menitsubuh = nilaishubuh.split(":")[1];

    const shubuh = {
      shubuh: `${parseFloat(jamsubuh, 10) + 24}:${parseFloat(menitsubuh, 10)}`,
    };

    for (const obj in shubuh) {
      newObj[obj] = shubuh[obj];
    }

    return newObj;
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

async function updateWaktuSholatFromAPI() {
  try {
    const dataWaktuSholat = await getDataWaktuSholat();

    for (const sholat in dataWaktuSholat) {
      waktuSholat[sholat] = convertWaktuKeDetik(dataWaktuSholat[sholat]);
    }

    return dataWaktuSholat;
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

function hitungWaktuSholat() {
  const sekarang = new Date();
  const detikSekarang =
    sekarang.getHours() * 3600 +
    sekarang.getMinutes() * 60 +
    sekarang.getSeconds();

  let waktuHinggaSholat = {};

  let sholatSelanjutnya = null;

  for (const sholat in waktuSholat) {
    let detikSholat = waktuSholat[sholat];
    if (detikSholat >= detikSekarang) {
      let sisaDetik = detikSholat - detikSekarang;
      let jam = Math.floor(sisaDetik / 3600);
      let menit = Math.floor((sisaDetik % 3600) / 60);
      let detik = sisaDetik % 60;
      jam = nol(jam);
      menit = nol(menit);
      detik = nol(detik);

      waktuHinggaSholat[sholat] = `${jam} : ${menit} : ${detik}`;

      if (
        sholatSelanjutnya === null ||
        detikSholat < waktuSholat[sholatSelanjutnya]
      ) {
        sholatSelanjutnya = sholat;
      }
    }
  }
  return {
    sholatSelanjutnya: sholatSelanjutnya,
    waktuHinggaSholat: waktuHinggaSholat,
  };
}

const audioplayer = document.getElementById("audio-player");

const jadwalWrapper = document.querySelector(".jadwal-sholat");

function masukWaktuSholat() {
  jadwalWrapper.classList.contains("active")
    ? audioplayer.play()
    : audioplayer.pause();

  audioplayer.addEventListener("ended", function () {
    jadwalWrapper.classList.remove("active");
  });
}

function updateTimer() {
  const { sholatSelanjutnya, waktuHinggaSholat } = hitungWaktuSholat();
  let timerHTML = "";
  if (sholatSelanjutnya) {
    timerHTML += `<p class="countdown"> ${sholatSelanjutnya} <br> <span >${waktuHinggaSholat[sholatSelanjutnya]}</span></p>`;
  }

  const waktusekarang = new Date();
  const detiksekarang =
    waktusekarang.getHours() * 3600 +
    waktusekarang.getMinutes() * 60 +
    waktusekarang.getSeconds();

  const jadwalShubuh = waktuSholat.subuh;

  const jadwaldzuhur = waktuSholat.dzuhur;

  const jadwalashar = waktuSholat.ashar;

  const jadwalamagrib = waktuSholat.maghrib;

  const jadwalmisya = waktuSholat.isya;

  if (detiksekarang >= jadwalmisya || detiksekarang < jadwalShubuh) {
    activeBox(waktuIsya, waktuShubuh);
  } else if (detiksekarang >= jadwalShubuh && detiksekarang < jadwaldzuhur) {
    activeBox(waktuShubuh, waktuDzuhur);
  } else if (detiksekarang >= jadwaldzuhur && detiksekarang < jadwalashar) {
    activeBox(waktuDzuhur, waktuAshar);
  } else if (detiksekarang >= jadwalashar && detiksekarang < jadwalamagrib) {
    activeBox(waktuAshar, waktuMagrib);
  } else if (detiksekarang >= jadwalamagrib && detiksekarang < jadwalmisya) {
    activeBox(waktuMagrib, waktuIsya);
  }

  if (detiksekarang == jadwalmisya) {
    jadwalWrapper.classList.add("active");
    masukWaktuSholat();
  } else if (detiksekarang == jadwalShubuh) {
    jadwalWrapper.classList.add("active");
    masukWaktuSholat();
  } else if (detiksekarang == jadwaldzuhur) {
    jadwalWrapper.classList.add("active");
    masukWaktuSholat();
  } else if (detiksekarang == jadwalashar) {
    jadwalWrapper.classList.add("active");
    masukWaktuSholat();
  } else if (detiksekarang == jadwalamagrib) {
    jadwalWrapper.classList.add("active");
    masukWaktuSholat();
  }

  const timer = document.getElementById("timer");
  timer.innerHTML = timerHTML;
}

function activeBox(r, a) {
  r.classList.remove("active");
  a.classList.add("active");
  r.style.filter = "brightness(1)";
  a.style.filter = "brightness(0.6)";
}

async function main() {
  updateWaktuSholatFromAPI();
  setInterval(() => {
    updateTimer();
    masukWaktuSholat();
  }, 1000);
}

function convertWaktuKeDetik(waktu) {
  const [jam, menit] = waktu.split(":");
  return parseInt(jam, 10) * 3600 + parseInt(menit, 10) * 60;
}

main();

function nol(number) {
  return String(number).padStart(2, "0");
}
