
document.addEventListener("DOMContentLoaded", function () {
  // Set the minimum selectable date to today.
  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().split("T")[0];

  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    input.min = localToday;
  });

  // Home page room search.
  const searchForm = document.getElementById("searchForm");

  if (searchForm) {
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");

    checkin.addEventListener("change", function () {
      checkout.min = checkin.value || localToday;

      if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = "";
      }
    });

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (checkout.value <= checkin.value) {
        alert("Check-out date must be after check-in date.");
        return;
      }

      const params = new URLSearchParams({
        checkin: checkin.value,
        checkout: checkout.value,
        guests: document.getElementById("guests").value
      });

      window.location.href = "rooms.html?" + params.toString();
    });
  }

  // Room category filter.
  const roomFilter = document.getElementById("roomFilter");

  if (roomFilter) {
    roomFilter.addEventListener("change", function () {
      document.querySelectorAll("#allRooms .room-card").forEach(function (card) {
        card.hidden =
          roomFilter.value !== "all" &&
          card.dataset.category !== roomFilter.value;
      });
    });
  }

  // Booking form.
  const bookingForm = document.getElementById("bookingForm");

  if (bookingForm) {
    const roomType = document.getElementById("roomType");
    const checkin = document.getElementById("bookingCheckin");
    const checkout = document.getElementById("bookingCheckout");
    const totalBox = document.getElementById("bookingTotal");
    const message = document.getElementById("bookingMessage");

    // Read the selected room from the room listing URL.
    const params = new URLSearchParams(window.location.search);
    const requestedRoom = params.get("room");

    if (requestedRoom) {
      for (const option of roomType.options) {
        if (option.value === requestedRoom) {
          roomType.value = requestedRoom;
          break;
        }
      }
    }

    const requestedPrice = Number(params.get("price"));
    if (requestedPrice && requestedPrice !==
        Number(roomType.selectedOptions[0].dataset.price)) {
      // Only prices defined in the room dropdown are used.
      // URL-supplied prices are never trusted.
    }

    function getNights() {
      if (!checkin.value || !checkout.value) return 0;

      const start = new Date(checkin.value + "T00:00:00Z");
      const end = new Date(checkout.value + "T00:00:00Z");

      return Math.round((end - start) / 86400000);
    }

    function updateTotal() {
      const nights = getNights();
      const price = Number(
        roomType.selectedOptions[0].dataset.price
      );

      if (nights <= 0) {
        totalBox.textContent =
          "Select a valid check-in and check-out date.";
        return;
      }

      totalBox.textContent =
        nights + " night(s) × ₹" + price.toLocaleString("en-IN") +
        " = Estimated total: ₹" +
        (nights * price).toLocaleString("en-IN");
    }

    checkin.addEventListener("change", function () {
      checkout.min = checkin.value || localToday;

      if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = "";
      }

      updateTotal();
    });

    checkout.addEventListener("change", updateTotal);
    roomType.addEventListener("change", updateTotal);

    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      message.textContent = "";

      const nights = getNights();

      if (nights <= 0) {
        message.textContent =
          "Please select valid check-in and check-out dates.";
        return;
      }

      const price = Number(
        roomType.selectedOptions[0].dataset.price
      );

      const booking = {
        reference: "DEMO-" + Date.now(),
        guestName: document.getElementById("guestName").value.trim(),
        guestEmail: document.getElementById("guestEmail").value.trim(),
        guestPhone: document.getElementById("guestPhone").value,
        room: roomType.value,
        checkin: checkin.value,
        checkout: checkout.value,
        guests: document.getElementById("bookingGuests").value,
        nights: nights,
        total: nights * price,
        status: "Demo request"
      };

      // Store only demo booking details, not passwords or payment data.
      try {
        const bookings = JSON.parse(
          localStorage.getItem("hotelproDemoBookings") || "[]"
        );

        bookings.push(booking);
        localStorage.setItem(
          "hotelproDemoBookings",
          JSON.stringify(bookings)
        );

        message.className = "notice";
        message.textContent =
          "Demo booking created! Reference: " + booking.reference +
          ". Estimated total: ₹" +
          booking.total.toLocaleString("en-IN") +
          ". No real room has been reserved and no payment was taken.";
      } catch (error) {
        message.textContent =
          "Unable to save the demo booking in this browser.";
      }
    });

    updateTotal();
  }

  // Login / registration interface toggle.
  const authForm = document.getElementById("authForm");

  if (authForm) {
    let isRegistering = false;

    const authSwitch = document.getElementById("authSwitch");
    const authTitle = document.getElementById("authTitle");
    const authSubmit = document.getElementById("authSubmit");
    const authName = document.getElementById("authName");
    const nameField = document.getElementById("nameField");
    const authMessage = document.getElementById("authMessage");
    const authPassword = document.getElementById("authPassword");

    authSwitch.addEventListener("click", function (event) {
      event.preventDefault();

      isRegistering = !isRegistering;
      nameField.hidden = !isRegistering;
      authName.required = isRegistering;

      authTitle.textContent = isRegistering
        ? "Create Your Account"
        : "Login to HotelPro";

      authSubmit.textContent = isRegistering
        ? "Register"
        : "Login";

      document.getElementById("authSwitchText").textContent =
        isRegistering ? "Already registered?" : "New to HotelPro?";

      authSwitch.textContent = isRegistering
        ? "Login instead"
        : "Create an account";

      authPassword.autocomplete = isRegistering
        ? "new-password"
        : "current-password";

      authMessage.textContent = "";
    });

    authForm.addEventListener("submit", function (event) {
      event.preventDefault();

      authMessage.className = "notice";
      authMessage.textContent = isRegistering
        ? "Registration interface is working. Connect the backend to create a real account."
        : "Login interface is working. Connect the backend to verify your credentials.";

      // This demo intentionally does not save passwords
      // or pretend to authenticate a user.
    });
  }
});
