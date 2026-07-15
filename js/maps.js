function goToLocation(lat, lng) {
    var url =
        "https://www.google.com/maps?q=" +
        lat +
        "," +
        lng;

    window.open(url, "_blank");
}
