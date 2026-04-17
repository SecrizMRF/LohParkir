export type AreaItem = {
  name: string;
  children?: AreaItem[];
};

export const PROVINCES: AreaItem[] = [
  {
    name: "Sumatera Utara",
    children: [
      {
        name: "Kota Medan",
        children: [
          {
            name: "Medan Kota",
            children: [
              { name: "Mesjid" }, { name: "Kotamatsum I" }, { name: "Kotamatsum II" },
              { name: "Kotamatsum III" }, { name: "Sei Rengas I" }, { name: "Sei Rengas II" },
              { name: "Sudirejo I" }, { name: "Sudirejo II" }, { name: "Teladan Barat" },
              { name: "Teladan Timur" }, { name: "Pasar Baru" }, { name: "Pusat Pasar" },
            ],
          },
          {
            name: "Medan Barat",
            children: [
              { name: "Glugur Kota" }, { name: "Karang Berombak" }, { name: "Kesawan" },
              { name: "Pulo Brayan Kota" }, { name: "Sei Agul" }, { name: "Silalas" },
            ],
          },
          {
            name: "Medan Baru",
            children: [
              { name: "Babura" }, { name: "Darat" }, { name: "Merdeka" },
              { name: "Padang Bulan" }, { name: "Petisah Hulu" }, { name: "Titi Rantai" },
            ],
          },
          {
            name: "Medan Polonia",
            children: [
              { name: "Anggrung" }, { name: "Madras Hulu" }, { name: "Polonia" },
              { name: "Sari Rejo" }, { name: "Suka Damai" },
            ],
          },
          {
            name: "Medan Petisah",
            children: [
              { name: "Petisah Tengah" }, { name: "Sekip" }, { name: "Sei Putih Barat" },
              { name: "Sei Putih Tengah" }, { name: "Sei Putih Timur I" }, { name: "Sei Putih Timur II" },
              { name: "Sei Sikambing D" },
            ],
          },
          {
            name: "Medan Maimun",
            children: [
              { name: "Aur" }, { name: "Hamdan" }, { name: "Jati" },
              { name: "Kampung Baru" }, { name: "Sei Mati" }, { name: "Suka Raja" },
            ],
          },
          {
            name: "Medan Timur",
            children: [
              { name: "Durian" }, { name: "Gaharu" }, { name: "Glugur Darat I" },
              { name: "Glugur Darat II" }, { name: "Gang Buntu" }, { name: "Pulo Brayan Bengkel" },
              { name: "Pulo Brayan Bengkel Baru" }, { name: "Pulo Brayan Darat I" },
              { name: "Pulo Brayan Darat II" }, { name: "Sidodadi" }, { name: "Sidorame Barat I" },
              { name: "Sidorame Barat II" }, { name: "Sidorame Timur" }, { name: "Sumber Rejo Hilir" },
            ],
          },
          {
            name: "Medan Selayang",
            children: [
              { name: "Asam Kumbang" }, { name: "Beringin" }, { name: "Padang Bulan Selayang I" },
              { name: "Padang Bulan Selayang II" }, { name: "Sempakata" }, { name: "Tanjung Sari" },
            ],
          },
          {
            name: "Medan Tuntungan",
            children: [
              { name: "Baru Ladang Bambu" }, { name: "Kemenangan Tani" }, { name: "Lau Cih" },
              { name: "Mangga" }, { name: "Namu Gajah" }, { name: "Sidomulyo" },
              { name: "Simalingkar B" }, { name: "Simpang Selayang" }, { name: "Tanjung Selamat" },
            ],
          },
          {
            name: "Medan Johor",
            children: [
              { name: "Gedung Johor" }, { name: "Kedai Durian" }, { name: "Kwala Bekala" },
              { name: "Pangkalan Mansyur" }, { name: "Suka Maju" }, { name: "Titi Kuning" },
            ],
          },
          {
            name: "Medan Amplas",
            children: [
              { name: "Amplas" }, { name: "Bangun Mulia" }, { name: "Harjosari I" },
              { name: "Harjosari II" }, { name: "Sitirejo II" }, { name: "Sitirejo III" },
              { name: "Timbang Deli" },
            ],
          },
          {
            name: "Medan Denai",
            children: [
              { name: "Binjai" }, { name: "Denai" }, { name: "Medan Tenggara" },
              { name: "Tegal Sari Mandala I" }, { name: "Tegal Sari Mandala II" },
              { name: "Tegal Sari Mandala III" },
            ],
          },
          {
            name: "Medan Area",
            children: [
              { name: "Kotamatsum IV" }, { name: "Pandau Hulu II" }, { name: "Pasar Merah Timur" },
              { name: "Sei Rengas Permata" }, { name: "Sukapulan" }, { name: "Tegal Sari I" },
              { name: "Tegal Sari II" }, { name: "Tegal Sari III" },
            ],
          },
          {
            name: "Medan Perjuangan",
            children: [
              { name: "Pahlawan" }, { name: "Pandau Hilir" }, { name: "Sei Kera Hilir I" },
              { name: "Sei Kera Hilir II" }, { name: "Sei Kera Hulu" }, { name: "Sidorame Barat I" },
              { name: "Tegal Rejo" },
            ],
          },
          {
            name: "Medan Tembung",
            children: [
              { name: "Bandar Selamat" }, { name: "Bantan" }, { name: "Bantan Timur" },
              { name: "Indra Kasih" }, { name: "Sidorejo" }, { name: "Sidorejo Hilir" },
              { name: "Tembung" },
            ],
          },
          {
            name: "Medan Helvetia",
            children: [
              { name: "Cinta Damai" }, { name: "Dwi Kora" }, { name: "Helvetia" },
              { name: "Helvetia Tengah" }, { name: "Helvetia Timur" }, { name: "Sei Sikambing C-II" },
              { name: "Tanjung Gusta" },
            ],
          },
          {
            name: "Medan Sunggal",
            children: [
              { name: "Babura" }, { name: "Lalang" }, { name: "Simpang Tanjung" },
              { name: "Sei Sikambing B" }, { name: "Sunggal" }, { name: "Tanjung Rejo" },
            ],
          },
          {
            name: "Medan Deli",
            children: [
              { name: "Kota Bangun" }, { name: "Mabar" }, { name: "Mabar Hilir" },
              { name: "Tanjung Mulia" }, { name: "Tanjung Mulia Hilir" }, { name: "Titi Papan" },
            ],
          },
          {
            name: "Medan Labuhan",
            children: [
              { name: "Besar" }, { name: "Martubung" }, { name: "Nelayan Indah" },
              { name: "Pekan Labuhan" }, { name: "Sei Mati" }, { name: "Tangkahan" },
            ],
          },
          {
            name: "Medan Marelan",
            children: [
              { name: "Labuhan Deli" }, { name: "Paya Pasir" }, { name: "Rengas Pulau" },
              { name: "Tanah Enam Ratus" }, { name: "Terjun" },
            ],
          },
          {
            name: "Medan Belawan",
            children: [
              { name: "Belawan Bahagia" }, { name: "Belawan Bahari" }, { name: "Belawan I" },
              { name: "Belawan II" }, { name: "Bagan Deli" }, { name: "Sicanang" },
            ],
          },
        ],
      },
      {
        name: "Kota Binjai",
        children: [
          { name: "Binjai Kota", children: [{ name: "Berngam" }, { name: "Pekan Binjai" }, { name: "Setia" }, { name: "Tangsi" }] },
          { name: "Binjai Utara", children: [{ name: "Cengkeh Turi" }, { name: "Damai" }, { name: "Jati Karya" }, { name: "Kebun Lada" }] },
          { name: "Binjai Selatan", children: [{ name: "Bhakti Karya" }, { name: "Binjai Estate" }, { name: "Pujidadi" }, { name: "Tanah Merah" }] },
        ],
      },
      {
        name: "Kabupaten Deli Serdang",
        children: [
          { name: "Lubuk Pakam", children: [{ name: "Lubuk Pakam I-II" }, { name: "Lubuk Pakam III" }, { name: "Pasar Melintang" }, { name: "Petapahan" }] },
          { name: "Tanjung Morawa", children: [{ name: "Tanjung Morawa A" }, { name: "Tanjung Morawa B" }, { name: "Limau Manis" }, { name: "Punden Rejo" }] },
          { name: "Deli Tua", children: [{ name: "Deli Tua" }, { name: "Deli Tua Barat" }, { name: "Deli Tua Timur" }, { name: "Mekar Sari" }] },
          { name: "Sunggal", children: [{ name: "Sei Semayang" }, { name: "Mulyo Rejo" }, { name: "Diski" }, { name: "Helvetia" }] },
        ],
      },
    ],
  },
];
