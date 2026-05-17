function hydrateMediaElement(element) {
  if (!element) return;

  const source = element.dataset?.src;
  const poster = element.dataset?.poster;

  if (poster && !element.getAttribute("poster")) {
    element.poster = poster;
    element.removeAttribute("data-poster");
  }

  if (source && !element.getAttribute("src")) {
    element.src = source;
    element.removeAttribute("data-src");
  }
}

function getNetworkConnection() {
  return (
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    null
  );
}

function hasConstrainedConnection() {
  const connection = getNetworkConnection();
  if (!connection) return false;

  const weakTypes = new Set(["slow-2g", "2g", "3g"]);
  return Boolean(
    connection.saveData ||
      weakTypes.has(connection.effectiveType) ||
      (connection.downlink && connection.downlink <= 1.5),
  );
}

function initLazyMedia() {
  const lazyMedia = Array.from(
    document.querySelectorAll("video[data-src], video[data-poster]"),
  );
  if (!lazyMedia.length) return;

  if (!("IntersectionObserver" in window)) {
    lazyMedia.forEach(hydrateMediaElement);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        hydrateMediaElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "400px 0px",
      threshold: 0.01,
    },
  );

  lazyMedia.forEach((element) => observer.observe(element));
}

function initNavMore() {
  const navMoreItems = Array.from(document.querySelectorAll(".nav-more"));
  if (!navMoreItems.length) return;

  navMoreItems.forEach((item) => {
    item.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        item.open = false;
      });
    });
  });

  document.addEventListener("click", (event) => {
    navMoreItems.forEach((item) => {
      if (!item.contains(event.target)) item.open = false;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    navMoreItems.forEach((item) => {
      item.open = false;
    });
  });
}

function initVideoLightbox() {
  const dialog = document.querySelector("#video-lightbox");
  const panel = dialog?.querySelector(".video-lightbox-panel");
  const media = dialog?.querySelector(".video-lightbox-media");
  const image = dialog?.querySelector(".image-lightbox-media");
  const closeButton = dialog?.querySelector(".video-lightbox-close");
  const title = dialog?.querySelector("#video-lightbox-title");
  const kicker = dialog?.querySelector("#video-lightbox-kicker");
  const caption = dialog?.querySelector(".video-lightbox-caption");
  if (
    !dialog ||
    !panel ||
    !media ||
    !image ||
    !closeButton ||
    !title ||
    !kicker ||
    !caption
  ) {
    return null;
  }

  const details = document.createElement("div");
  details.className = "video-lightbox-details";
  details.hidden = true;
  caption.append(details);

  let returnFocusTo = null;
  let shouldRestoreFocus = false;
  let isClosing = false;
  let lockedScroll = null;
  let lockedBodyStyles = null;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setLightboxAspect = (width, height) => {
    if (!width || !height) return;
    dialog.style.setProperty("--media-aspect", `${width} / ${height}`);
  };

  media.addEventListener("loadedmetadata", () => {
    setLightboxAspect(media.videoWidth, media.videoHeight);
  });

  image.addEventListener("load", () => {
    setLightboxAspect(image.naturalWidth, image.naturalHeight);
  });

  const showVideo = () => {
    dialog.classList.remove("is-image-mode");
    media.hidden = false;
    image.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
  };

  const showImage = () => {
    dialog.classList.add("is-image-mode");
    media.pause();
    media.hidden = true;
    image.hidden = false;
    media.removeAttribute("src");
    media.removeAttribute("poster");
    media.load();
  };

  const getOriginRect = (origin) => {
    if (!origin?.isConnected) return null;
    const rect = origin.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    if (
      rect.right < 0 ||
      rect.bottom < 0 ||
      rect.left > window.innerWidth ||
      rect.top > window.innerHeight
    ) {
      return null;
    }
    return rect;
  };

  const animatePanelFromOrigin = (origin, reverse = false) => {
    if (motionQuery.matches || typeof panel.animate !== "function") {
      return Promise.resolve();
    }

    const originRect = getOriginRect(origin);
    const panelRect = panel.getBoundingClientRect();
    if (!originRect || !panelRect.width || !panelRect.height) {
      return Promise.resolve();
    }

    panel.getAnimations().forEach((animation) => animation.cancel());

    const scale = Math.min(
      originRect.width / panelRect.width,
      originRect.height / panelRect.height,
    );
    const scaledWidth = panelRect.width * scale;
    const scaledHeight = panelRect.height * scale;
    const translateX =
      originRect.left + (originRect.width - scaledWidth) / 2 - panelRect.left;
    const translateY =
      originRect.top + (originRect.height - scaledHeight) / 2 - panelRect.top;
    const sharedOrigin = {
      borderRadius: "6px",
      opacity: 0.72,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transformOrigin: "top left",
    };
    const expanded = {
      borderRadius: "8px",
      opacity: 1,
      transform: "translate(0, 0) scale(1)",
      transformOrigin: "top left",
    };

    const animation = panel.animate(reverse ? [expanded, sharedOrigin] : [sharedOrigin, expanded], {
      duration: reverse ? 190 : 240,
      easing: reverse ? "cubic-bezier(0.4, 0, 1, 1)" : "cubic-bezier(0.16, 1, 0.3, 1)",
    });

    return animation.finished.catch(() => {});
  };

  const lockPageScroll = (scrollSnapshot = null) => {
    if (lockedScroll) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    lockedScroll = scrollSnapshot || {
      x: window.scrollX,
      y: window.scrollY,
    };
    lockedBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScroll.y}px`;
    document.body.style.left = `-${lockedScroll.x}px`;
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  };

  const unlockPageScroll = () => {
    if (!lockedScroll || !lockedBodyStyles) return;

    const { x, y } = lockedScroll;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;

    document.body.style.position = lockedBodyStyles.position;
    document.body.style.top = lockedBodyStyles.top;
    document.body.style.left = lockedBodyStyles.left;
    document.body.style.right = lockedBodyStyles.right;
    document.body.style.width = lockedBodyStyles.width;
    document.body.style.paddingRight = lockedBodyStyles.paddingRight;
    lockedScroll = null;
    lockedBodyStyles = null;

    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(x, y);
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
  };

  const openDialog = (origin, scrollSnapshot = null) => {
    if (dialog.open) return;
    lockPageScroll(scrollSnapshot);
    dialog.showModal();
    requestAnimationFrame(() => {
      animatePanelFromOrigin(origin);
    });
  };

  const suppressReturnHighlight = (target) => {
    if (!target?.isConnected) return;

    target.classList.add("is-returning");
    if (document.activeElement === target) {
      target.blur();
    }

    let timer = 0;
    const clearSuppression = () => {
      window.clearTimeout(timer);
      target.classList.remove("is-returning");
      target.removeEventListener("pointerleave", clearSuppression);
    };

    timer = window.setTimeout(() => {
      if (!target.matches(":hover")) {
        clearSuppression();
      }
    }, 900);
    target.addEventListener("pointerleave", clearSuppression, { once: true });
  };

  const resetLightbox = () => {
    media.pause();
    media.removeAttribute("src");
    media.removeAttribute("poster");
    media.load();
    media.hidden = false;
    image.removeAttribute("src");
    image.alt = "";
    image.hidden = true;
    dialog.classList.remove("is-image-mode");
    dialog.style.removeProperty("--media-aspect");

    if (dialog.open) {
      dialog.close();
    }
    unlockPageScroll();
    details.hidden = true;
    details.replaceChildren();
    dialog.classList.remove("has-qa-details");

    const focusTarget = returnFocusTo;
    returnFocusTo = null;

    if (shouldRestoreFocus && focusTarget?.isConnected) {
      focusTarget.focus({ preventScroll: true });
    } else {
      suppressReturnHighlight(focusTarget);
    }
    shouldRestoreFocus = false;
  };

  const closeLightbox = async () => {
    if (isClosing) return;
    isClosing = true;
    await animatePanelFromOrigin(returnFocusTo, true);
    resetLightbox();
    isClosing = false;
  };

  closeButton.addEventListener("click", closeLightbox);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeLightbox();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeLightbox();
    }
  });

  dialog.addEventListener("close", () => {
    media.pause();
  });

  const renderDetails = (detailItems = []) => {
    details.replaceChildren();

    const validItems = detailItems.filter((item) => item?.value);
    if (!validItems.length) {
      details.hidden = true;
      dialog.classList.remove("has-qa-details");
      return;
    }

    validItems.forEach((item) => {
      const block = document.createElement("div");
      block.className = "video-lightbox-detail-block";

      const label = document.createElement("span");
      label.textContent = item.label;

      const value = document.createElement("p");
      value.textContent = item.value;

      block.append(label, value);
      details.append(block);
    });

    details.hidden = false;
    dialog.classList.add("has-qa-details");
  };

  const openVideo = (item, options = {}) => {
    const source = item.querySelector("video");
    if (!source) return;
    hydrateMediaElement(source);

    document.dispatchEvent(new CustomEvent("lance:pause-grid-videos"));
    showVideo();

    const label =
      item.dataset.previewTitle ||
      item.querySelector(".video-prompt")?.textContent?.trim() ||
      "Video preview";
    const sectionTitle =
      item.closest(".section")?.querySelector(".section-title")?.textContent?.trim() ||
      "Demo";
    const origin = options.origin || item;
    const fullCaption = getReadableText(item.querySelector(".video-full-caption"));
    const promptLabel =
      item.dataset.promptLabel ||
      item.closest(".section")?.dataset.promptLabel ||
      "Prompt";
    const detailItems = fullCaption
      ? [...(options.details || []), { label: promptLabel, value: fullCaption }]
      : options.details;

    returnFocusTo = origin;
    shouldRestoreFocus = Boolean(options.restoreFocus);
    title.textContent = options.title || label;
    kicker.textContent = options.kicker || sectionTitle;
    renderDetails(detailItems);
    media.src =
      source.currentSrc || source.getAttribute("src") || source.dataset.src || "";
    media.poster = source.getAttribute("poster") || source.dataset.poster || "";
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    setLightboxAspect(source.videoWidth, source.videoHeight);

    openDialog(origin, options.scrollSnapshot);

    media.play().catch(() => {});
  };

  const openImage = (source, options = {}) => {
    if (!source) return;

    document.dispatchEvent(new CustomEvent("lance:pause-grid-videos"));
    showImage();

    const label = source.getAttribute("alt") || "Figure preview";
    const sectionTitle =
      source.closest(".section")?.querySelector(".section-title")?.textContent?.trim() ||
      "Figure";
    const width = source.naturalWidth || Number(source.getAttribute("width"));
    const height = source.naturalHeight || Number(source.getAttribute("height"));
    const origin = options.origin || source;

    returnFocusTo = origin;
    shouldRestoreFocus = Boolean(options.restoreFocus);
    title.textContent = options.title || label;
    kicker.textContent = options.kicker || sectionTitle;
    renderDetails(options.details);
    image.src = source.currentSrc || source.src;
    image.alt = label;
    setLightboxAspect(width, height);

    openDialog(origin, options.scrollSnapshot);
  };

  return { openVideo, openImage };
}

function initImageLightbox(openImage) {
  const images = Array.from(
    document.querySelectorAll(
      [
        ".scroll-zoom-img",
        ".image-editing-img",
        ".framework-img",
        ".benchmark-radar-img",
      ].join(", "),
    ),
  );
  if (!images.length || !openImage) return;

  images.forEach((image) => {
    const label = image.getAttribute("alt") || "figure";
    let pointerScrollSnapshot = null;

    image.classList.add("zoomable-media");
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Open ${label} figure`);

    image.addEventListener(
      "pointerdown",
      () => {
        pointerScrollSnapshot = { x: window.scrollX, y: window.scrollY };
      },
      { passive: true },
    );
    image.addEventListener("click", () => {
      openImage(image, {
        restoreFocus: false,
        scrollSnapshot: pointerScrollSnapshot,
      });
      pointerScrollSnapshot = null;
    });
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openImage(image, { restoreFocus: true });
      }
    });
  });
}

function getReadableText(element) {
  if (!element) return "";

  const lineBreakMarker = "\uE000";
  const clone = element.cloneNode(true);
  clone.querySelectorAll("br").forEach((breakNode) => {
    breakNode.replaceWith(document.createTextNode(` ${lineBreakMarker} `));
  });

  return clone.textContent
    .replace(/\s+/g, " ")
    .replace(new RegExp(`\\s*${lineBreakMarker}\\s*`, "g"), "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getAnswerText(element) {
  if (!element) return "";

  const clone = element.cloneNode(true);
  clone.querySelectorAll("span").forEach((label) => label.remove());
  return getReadableText(clone);
}

function initUnderstandingCaseLightboxes(openVideo, openImage) {
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const videoCards = Array.from(
    document.querySelectorAll(".video-understanding-card"),
  );
  const imageCards = Array.from(document.querySelectorAll(".understanding-card"));

  const getVideoDetails = (card) => [
    {
      label: "Question",
      value: getReadableText(card.querySelector(".video-understanding-primary")),
    },
    {
      label: "Response",
      value: getReadableText(card.querySelector(".video-understanding-answer")),
    },
  ];

  const getImageDetails = (card) => [
    {
      label: "Question",
      value: getReadableText(card.querySelector(".understanding-question")),
    },
    {
      label: "Response",
      value: getAnswerText(card.querySelector(".understanding-answer")),
    },
  ];

  const pauseVideoCard = (card) => {
    const video = card.querySelector("video");
    if (!video) return;
    video.pause();
    card.classList.remove("is-active");
  };

  const pauseAllVideoCards = (exceptCard = null) => {
    videoCards.forEach((card) => {
      if (card !== exceptCard) pauseVideoCard(card);
    });
  };

  const playVideoCard = (card) => {
    if (motionQuery.matches || card.classList.contains("is-returning")) return;

    const video = card.querySelector("video");
    if (!video) return;

    pauseAllVideoCards(card);
    document.dispatchEvent(new CustomEvent("lance:pause-grid-videos"));
    hydrateMediaElement(video);
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const promise = video.play();
    card.classList.add("is-active");

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        card.classList.remove("is-active");
      });
    }
  };

  const openVideoCard = (card, options = {}) => {
    if (!openVideo) return;

    const details = getVideoDetails(card);
    const prompt =
      card.querySelector(".video-prompt")?.textContent?.trim() ||
      "Video understanding";

    openVideo(card, {
      ...options,
      origin: card,
      title: prompt,
      kicker: "Video Understanding",
      details,
    });
  };

  const openImageCard = (card, options = {}) => {
    if (!openImage) return;

    const image = card.querySelector(".understanding-img");
    if (!image) return;

    const details = getImageDetails(card);

    openImage(image, {
      ...options,
      origin: card,
      title: "Image understanding case",
      kicker: "Image Understanding",
      details,
    });
  };

  videoCards.forEach((card) => {
    const video = card.querySelector("video");
    const details = getVideoDetails(card);
    const question = details[0]?.value || "video understanding case";
    let pointerScrollSnapshot = null;

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${question}`);

    if (video) {
      video.autoplay = false;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      video.pause();
    }

    card.addEventListener("mouseenter", () => playVideoCard(card));
    card.addEventListener("focusin", () => playVideoCard(card));
    card.addEventListener("mouseleave", () => pauseVideoCard(card));
    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget)) {
        pauseVideoCard(card);
      }
    });
    card.addEventListener(
      "pointerdown",
      () => {
        pointerScrollSnapshot = { x: window.scrollX, y: window.scrollY };
      },
      { passive: true },
    );
    card.addEventListener("click", () => {
      openVideoCard(card, {
        restoreFocus: false,
        scrollSnapshot: pointerScrollSnapshot,
      });
      pointerScrollSnapshot = null;
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openVideoCard(card, { restoreFocus: true });
      }
    });
  });

  imageCards.forEach((card) => {
    const details = getImageDetails(card);
    const question = details[0]?.value || "image understanding case";
    let pointerScrollSnapshot = null;

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${question}`);

    card.addEventListener(
      "pointerdown",
      () => {
        pointerScrollSnapshot = { x: window.scrollX, y: window.scrollY };
      },
      { passive: true },
    );
    card.addEventListener("click", () => {
      openImageCard(card, {
        restoreFocus: false,
        scrollSnapshot: pointerScrollSnapshot,
      });
      pointerScrollSnapshot = null;
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openImageCard(card, { restoreFocus: true });
      }
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAllVideoCards();
    }
  });

  document.addEventListener("lance:pause-grid-videos", () => {
    pauseAllVideoCards();
  });
}

function initVideoPreviews(openPreview) {
  const items = Array.from(
    document.querySelectorAll(".video-item:not(.video-understanding-media)"),
  );
  if (!items.length) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hoverFallbackQuery = window.matchMedia("(hover: hover)");
  const sequenceGroups = Array.from(
    document.querySelectorAll("#multi-round-editing .video-flow"),
  );
  const sequenceItems = new Set(
    sequenceGroups.flatMap((group) => Array.from(group.querySelectorAll(".video-item"))),
  );

  const setActiveState = (item, active) => {
    item.classList.toggle("is-active", active);
  };

  const pauseItem = (item) => {
    const video = item.querySelector("video");
    if (!video) return;
    video.pause();
    setActiveState(item, false);
  };

  const pauseAll = (exceptItem = null) => {
    items.forEach((item) => {
      if (item === exceptItem) return;
      pauseItem(item);
    });
  };

  const playItem = (item) => {
    if (item.classList.contains("is-returning")) return;

    const video = item.querySelector("video");
    if (!video) return;

    pauseAll(item);
    hydrateMediaElement(video);
    const promise = video.play();
    setActiveState(item, true);

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        setActiveState(item, false);
      });
    }
  };

  const pauseSequence = (group) => {
    group.querySelectorAll(".video-item").forEach((item) => pauseItem(item));
  };

  const playSequence = (group, pointerType = "mouse") => {
    if (motionQuery.matches || pointerType !== "mouse") return;

    const groupItems = Array.from(group.querySelectorAll(".video-item"));
    pauseAll();

    groupItems.forEach((item) => {
      if (item.classList.contains("is-returning")) return;

      const video = item.querySelector("video");
      if (!video) return;

      hydrateMediaElement(video);
      const promise = video.play();
      setActiveState(item, true);

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          setActiveState(item, false);
        });
      }
    });
  };

  items.forEach((item) => {
    const video = item.querySelector("video");
    const prompt = item.querySelector(".video-prompt")?.textContent?.trim();
    let pointerScrollSnapshot = null;
    const isSequenceItem = sequenceItems.has(item);
    if (!video) return;

    item.tabIndex = 0;
    item.setAttribute("role", "button");
    if (prompt) {
      item.setAttribute("aria-label", `Open ${prompt} preview`);
    }

    video.autoplay = false;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.pause();

    if (!isSequenceItem) {
      item.addEventListener("mouseenter", () => {
        if (motionQuery.matches) return;
        playItem(item);
      });

      item.addEventListener("focusin", () => {
        if (motionQuery.matches) return;
        playItem(item);
      });

      item.addEventListener("mouseleave", () => {
        pauseItem(item);
      });

      item.addEventListener("focusout", () => {
        pauseItem(item);
      });
    }

    item.addEventListener(
      "pointerdown",
      () => {
        pointerScrollSnapshot = { x: window.scrollX, y: window.scrollY };
      },
      { passive: true },
    );
    item.addEventListener("click", () => {
      if (openPreview) {
        openPreview(item, {
          restoreFocus: false,
          scrollSnapshot: pointerScrollSnapshot,
        });
        pointerScrollSnapshot = null;
      } else {
        playItem(item);
      }
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (openPreview) {
          openPreview(item, { restoreFocus: true });
        } else {
          playItem(item);
        }
      }
    });
  });

  sequenceGroups.forEach((group) => {
    if ("PointerEvent" in window) {
      group.addEventListener("pointerenter", (event) => {
        playSequence(group, event.pointerType);
      });

      group.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse") {
          pauseSequence(group);
        }
      });
    } else {
      group.addEventListener("mouseenter", () => {
        if (hoverFallbackQuery.matches) playSequence(group);
      });

      group.addEventListener("mouseleave", () => {
        if (hoverFallbackQuery.matches) pauseSequence(group);
      });
    }
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            pauseItem(entry.target);
          }
        });
      },
      { threshold: 0.25 },
    );

    items.forEach((item) => observer.observe(item));
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAll();
      sequenceGroups.forEach(pauseSequence);
    }
  });

  document.addEventListener("lance:pause-grid-videos", () => {
    pauseAll();
    sequenceGroups.forEach(pauseSequence);
  });
}

function initShowcaseVideos() {
  const cards = Array.from(document.querySelectorAll(".showcase-card"));
  if (!cards.length) return;

  const primaryCard = document.querySelector(".showcase-card-large");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let primaryInView = true;
  let primaryAutoplayEnabled = false;
  let primaryAutoplayScheduled = false;

  const canAutoplayPrimary = () =>
    Boolean(primaryCard) &&
    primaryAutoplayEnabled &&
    primaryInView &&
    !document.hidden &&
    !motionQuery.matches &&
    !hasConstrainedConnection();

  const stopCard = (card, reset = false) => {
    const video = card.querySelector(".showcase-video");
    if (!video) return;
    video.pause();
    if (reset) {
      video.currentTime = 0;
    }
    card.classList.remove("is-playing");
  };

  const stopAll = (exceptCard = null) => {
    cards.forEach((card) => {
      if (card !== exceptCard) stopCard(card);
    });
  };

  const playCard = (card, options = {}) => {
    if (motionQuery.matches) return;
    const video = card.querySelector(".showcase-video");
    if (!video) return;

    stopAll(card);
    hydrateMediaElement(video);
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    if (options.isAutoplay) {
      video.preload = "auto";
    }

    const promise = video.play();
    if (promise && typeof promise.then === "function") {
      promise
        .then(() => card.classList.add("is-playing"))
        .catch(() => card.classList.remove("is-playing"));
      return;
    }

    card.classList.add("is-playing");
  };

  const autoplayPrimary = () => {
    if (!canAutoplayPrimary()) return;
    playCard(primaryCard, { isAutoplay: true });
  };

  const syncPrimaryAutoplay = () => {
    if (canAutoplayPrimary()) {
      autoplayPrimary();
    } else if (primaryCard) {
      stopCard(primaryCard, true);
    }
  };

  cards.forEach((card) => {
    const video = card.querySelector(".showcase-video");
    if (!video) return;

    video.autoplay = false;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.removeAttribute("autoplay");
    video.preload = "none";
    video.pause();

    card.addEventListener("mouseenter", () => playCard(card));
    card.addEventListener("focusin", () => playCard(card));
    card.addEventListener("mouseleave", () => {
      if (card === primaryCard && canAutoplayPrimary()) {
        autoplayPrimary();
        return;
      }
      stopCard(card);
      if (card !== primaryCard) autoplayPrimary();
    });
    card.addEventListener("focusout", () => {
      if (card === primaryCard && canAutoplayPrimary()) {
        autoplayPrimary();
        return;
      }
      stopCard(card);
      if (card !== primaryCard) autoplayPrimary();
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === primaryCard) {
            primaryInView = entry.isIntersecting;
            if (entry.isIntersecting) {
              syncPrimaryAutoplay();
            } else {
              stopCard(entry.target, true);
            }
            return;
          }

          if (!entry.isIntersecting) {
            stopCard(entry.target, true);
          }
        });
      },
      { threshold: 0.1 },
    );

    cards.forEach((card) => observer.observe(card));
  } else {
    syncPrimaryAutoplay();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAll();
    } else {
      syncPrimaryAutoplay();
    }
  });

  [motionQuery].forEach((query) => {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", syncPrimaryAutoplay);
    } else if (typeof query.addListener === "function") {
      query.addListener(syncPrimaryAutoplay);
    }
  });

  const enablePrimaryAutoplay = () => {
    primaryAutoplayScheduled = false;
    if (hasConstrainedConnection()) return;
    primaryAutoplayEnabled = true;
    syncPrimaryAutoplay();
  };

  const schedulePrimaryAutoplay = () => {
    if (
      primaryAutoplayEnabled ||
      primaryAutoplayScheduled ||
      hasConstrainedConnection()
    ) {
      return;
    }

    primaryAutoplayScheduled = true;
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(enablePrimaryAutoplay, { timeout: 1800 });
    } else {
      window.setTimeout(enablePrimaryAutoplay, 1200);
    }
  };

  schedulePrimaryAutoplay();

  const connection = getNetworkConnection();
  if (connection && typeof connection.addEventListener === "function") {
    connection.addEventListener("change", () => {
      if (hasConstrainedConnection()) {
        primaryAutoplayEnabled = false;
        primaryAutoplayScheduled = false;
        if (primaryCard) stopCard(primaryCard, true);
        return;
      }

      schedulePrimaryAutoplay();
    });
  }
}

function initCitationCopy() {
  const button = document.querySelector(".copy-citation-btn");
  const citation = document.querySelector(".citation-block code");
  if (!button || !citation) return;

  const resetButton = () => {
    button.classList.remove("is-copied");
    button.setAttribute("aria-label", "Copy citation");
    button.title = "Copy citation";
  };

  const copyWithFallback = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Continue to the selection-based fallback below.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  button.addEventListener("click", async () => {
    try {
      await copyWithFallback(citation.textContent.trim());
      button.classList.add("is-copied");
      button.setAttribute("aria-label", "Citation copied");
      button.title = "Citation copied";
      window.setTimeout(resetButton, 1600);
    } catch {
      button.setAttribute("aria-label", "Copy failed");
      button.title = "Copy failed";
      window.setTimeout(resetButton, 1600);
    }
  });
}

function initMetricColumnFrames() {
  document.querySelectorAll(".metric-frame-layer").forEach((frameLayer) => {
    const table = frameLayer.querySelector(".highlight-metric-table");
    const container = frameLayer.querySelector(".benchmark-container");
    const highlightColumn = Number(frameLayer.dataset.highlightColumn || 3);
    const modelHeader = table?.querySelector("thead th:nth-child(1)");
    const paramsHeader = table?.querySelector("thead th:nth-child(2)");
    const headerCell = table?.querySelector(`thead th:nth-child(${highlightColumn})`);
    if (
      !table ||
      !container ||
      !modelHeader ||
      !paramsHeader ||
      !headerCell
    ) {
      return;
    }

    const frame = document.createElement("div");
    frame.className = "metric-column-frame";
    frame.setAttribute("aria-hidden", "true");
    frameLayer.append(frame);

    let frameRequest = null;

    const updateFrame = () => {
      if (frameRequest) return;
      frameRequest = requestAnimationFrame(() => {
        frameRequest = null;
        const modelWidth = modelHeader.getBoundingClientRect().width;
        const paramsWidth = paramsHeader.getBoundingClientRect().width;
        const highlightWidth = headerCell.getBoundingClientRect().width;
        table.style.setProperty("--summary-model-col", `${modelWidth}px`);
        table.style.setProperty("--summary-param-col", `${paramsWidth}px`);
        table.style.setProperty("--summary-highlight-col", `${highlightWidth}px`);

        const frameLayerRect = frameLayer.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        const frameInsetX = -6;
        const frameOutsetY = 18;
        const pinnedLeft =
          containerRect.left +
          container.clientLeft +
          modelWidth +
          paramsWidth;
        const left = pinnedLeft - frameLayerRect.left + frameInsetX;
        const top = tableRect.top - frameLayerRect.top - frameOutsetY;
        const width = Math.max(highlightWidth - frameInsetX * 2, 40);
        const height = tableRect.height + frameOutsetY * 2;

        frame.style.left = `${left}px`;
        frame.style.top = `${top}px`;
        frame.style.width = `${width}px`;
        frame.style.height = `${height}px`;
      });
    };

    updateFrame();
    container.addEventListener("scroll", updateFrame, { passive: true });
    window.addEventListener("resize", updateFrame, { passive: true });
    if (document.fonts?.ready) {
      document.fonts.ready.then(updateFrame);
    }
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateFrame);
      observer.observe(table);
      observer.observe(container);
      observer.observe(frameLayer);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLazyMedia();
  initNavMore();
  initShowcaseVideos();
  const lightbox = initVideoLightbox();
  initVideoPreviews(lightbox?.openVideo);
  initImageLightbox(lightbox?.openImage);
  initUnderstandingCaseLightboxes(lightbox?.openVideo, lightbox?.openImage);
  initCitationCopy();
  initMetricColumnFrames();
});
