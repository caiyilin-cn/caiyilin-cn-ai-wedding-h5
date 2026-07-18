document.addEventListener('DOMContentLoaded', () => {
  const state = {
    groomPhoto: '',
    bridePhoto: '',
    style: 'editorial'
  };

  const el = {
    groomInput: document.getElementById('groomPhoto'),
    brideInput: document.getElementById('bridePhoto'),
    groomPreview: document.getElementById('groomPreview'),
    bridePreview: document.getElementById('bridePreview'),
    groomPlaceholder: document.getElementById('groomPlaceholder'),
    bridePlaceholder: document.getElementById('bridePlaceholder'),
    removeGroom: document.getElementById('removeGroom'),
    removeBride: document.getElementById('removeBride'),
    groomName: document.getElementById('groomName'),
    brideName: document.getElementById('brideName'),
    weddingDate: document.getElementById('weddingDate'),
    styleButtons: [...document.querySelectorAll('.style-option')],
    generateButton: document.getElementById('generateButton'),
    formError: document.getElementById('formError'),
    creatorCard: document.getElementById('creatorCard'),
    loadingCard: document.getElementById('loadingCard'),
    loadingMessage: document.getElementById('loadingMessage'),
    loadingBar: document.getElementById('loadingBar'),
    resultWrap: document.getElementById('resultWrap'),
    resultNames: document.getElementById('resultNames'),
    resultDate: document.getElementById('resultDate'),
    resultGroom: document.getElementById('resultGroom'),
    resultBride: document.getElementById('resultBride'),
    resultLine: document.getElementById('resultLine'),
    generatedGrid: document.getElementById('generatedGrid'),
    shareText: document.getElementById('shareText'),
    copyText: document.getElementById('copyText'),
    editAgain: document.getElementById('editAgain')
  };

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  el.weddingDate.value = defaultDate.toISOString().slice(0, 10);

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('请选择图片文件'));
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error('图片不能超过 15MB'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('图片读取失败，请重新选择'));
      reader.readAsDataURL(file);
    });
  }

  async function handlePhoto(side, file) {
    try {
      el.formError.textContent = '';
      const dataUrl = await fileToDataURL(file);
      const isGroom = side === 'groom';
      state[isGroom ? 'groomPhoto' : 'bridePhoto'] = dataUrl;
      const preview = isGroom ? el.groomPreview : el.bridePreview;
      const placeholder = isGroom ? el.groomPlaceholder : el.bridePlaceholder;
      const removeButton = isGroom ? el.removeGroom : el.removeBride;
      preview.src = dataUrl;
      preview.hidden = false;
      placeholder.hidden = true;
      removeButton.hidden = false;
    } catch (error) {
      el.formError.textContent = error.message;
    }
  }

  function clearPhoto(side) {
    const isGroom = side === 'groom';
    state[isGroom ? 'groomPhoto' : 'bridePhoto'] = '';
    const input = isGroom ? el.groomInput : el.brideInput;
    const preview = isGroom ? el.groomPreview : el.bridePreview;
    const placeholder = isGroom ? el.groomPlaceholder : el.bridePlaceholder;
    const removeButton = isGroom ? el.removeGroom : el.removeBride;
    input.value = '';
    preview.src = '';
    preview.hidden = true;
    placeholder.hidden = false;
    removeButton.hidden = true;
  }

  el.groomInput.addEventListener('change', event => handlePhoto('groom', event.target.files[0]));
  el.brideInput.addEventListener('change', event => handlePhoto('bride', event.target.files[0]));
  el.removeGroom.addEventListener('click', () => clearPhoto('groom'));
  el.removeBride.addEventListener('click', () => clearPhoto('bride'));

  el.styleButtons.forEach(button => {
    button.addEventListener('click', () => {
      state.style = button.dataset.style;
      el.styleButtons.forEach(item => item.classList.toggle('active', item === button));
    });
  });

  function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }

  function styleText(style) {
    return {
      editorial: {
        line: '诚邀您见证我们的幸福时刻',
        share: '我们决定，把往后的日子写成同一个名字。诚邀你见证这场属于我们的婚礼。'
      },
      romantic: {
        line: '从初见心动，到余生同行',
        share: '故事从一次相遇开始，也将在无数个平凡日子里继续。诚邀你见证我们的幸福时刻。'
      },
      classic: {
        line: '两姓联姻，一堂缔约',
        share: '良辰已定，佳期将至。敬备喜宴，恭请莅临，共同见证我们的新婚之喜。'
      }
    }[style];
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('图片加载失败'));
      image.src = src;
    });
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function drawCoverImage(ctx, image, x, y, width, height, radius = 0) {
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;
    ctx.save();
    if (radius > 0) {
      roundedRect(ctx, x, y, width, height, radius);
      ctx.clip();
    }
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }

  function drawCenteredText(ctx, text, y, font, color) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, 450, y);
    ctx.restore();
  }

  async function makePoster(index, groomName, brideName, dateText) {
    const [groomImage, brideImage] = await Promise.all([
      loadImage(state.groomPhoto),
      loadImage(state.bridePhoto)
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');

    const palettes = {
      editorial: ['#f4efe9', '#2b2220', '#8f3d4f'],
      romantic: ['#f7ecee', '#5a3640', '#c48394'],
      classic: ['#f6efe2', '#5b251f', '#a7352c']
    };
    const [background, ink, accent] = palettes[state.style];
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 900, 1200);

    if (index === 0) {
      drawCenteredText(ctx, 'WEDDING PORTRAIT', 90, '24px Georgia', accent);
      drawCoverImage(ctx, groomImage, 70, 160, 350, 720, 24);
      drawCoverImage(ctx, brideImage, 480, 160, 350, 720, 24);
      drawCenteredText(ctx, `${groomName}  &  ${brideName}`, 980, '54px Georgia, serif', ink);
      drawCenteredText(ctx, dateText, 1045, '28px Arial', accent);
      drawCenteredText(ctx, 'THE BEGINNING OF FOREVER', 1120, '20px Georgia', ink);
    }

    if (index === 1) {
      const gradient = ctx.createLinearGradient(0, 0, 900, 1200);
      gradient.addColorStop(0, '#d9b9c0');
      gradient.addColorStop(1, '#7d4050');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 900, 1200);
      ctx.globalAlpha = 0.92;
      drawCoverImage(ctx, groomImage, 90, 200, 420, 680, 210);
      drawCoverImage(ctx, brideImage, 390, 320, 420, 680, 210);
      ctx.globalAlpha = 1;
      drawCenteredText(ctx, 'LOVE IN BLOOM', 1080, '52px Georgia', '#fffaf7');
      drawCenteredText(ctx, `${groomName} × ${brideName}`, 1140, '24px Arial', '#fffaf7');
    }

    if (index === 2) {
      ctx.fillStyle = ink;
      ctx.fillRect(0, 0, 900, 250);
      drawCenteredText(ctx, 'JUST MARRIED', 135, '56px Georgia', '#ffffff');
      drawCoverImage(ctx, groomImage, 60, 315, 360, 610, 16);
      drawCoverImage(ctx, brideImage, 480, 315, 360, 610, 16);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(110, 1010, 680, 110);
      drawCenteredText(ctx, dateText, 1080, '34px Arial', ink);
    }

    if (index === 3) {
      drawCoverImage(ctx, groomImage, 0, 0, 450, 1200);
      drawCoverImage(ctx, brideImage, 450, 0, 450, 1200);
      const overlay = ctx.createLinearGradient(0, 520, 0, 1200);
      overlay.addColorStop(0, 'rgba(0,0,0,0)');
      overlay.addColorStop(1, 'rgba(0,0,0,.72)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 420, 900, 780);
      drawCenteredText(ctx, 'OUR WEDDING DAY', 950, '30px Georgia', '#ffffff');
      drawCenteredText(ctx, `${groomName} & ${brideName}`, 1035, '58px Georgia', '#ffffff');
      drawCenteredText(ctx, dateText, 1110, '25px Arial', '#ffffff');
    }

    if (index === 4) {
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, 900, 1200);
      drawCenteredText(ctx, 'SAVE THE DATE', 100, '30px Georgia', '#ffffff');
      drawCoverImage(ctx, groomImage, 80, 190, 330, 600, 170);
      drawCoverImage(ctx, brideImage, 490, 190, 330, 600, 170);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(450, 490, 42, 0, Math.PI * 2);
      ctx.stroke();
      drawCenteredText(ctx, '&', 510, '54px Georgia', '#ffffff');
      drawCenteredText(ctx, `${groomName}  /  ${brideName}`, 910, '48px Georgia', '#ffffff');
      drawCenteredText(ctx, dateText, 985, '26px Arial', '#ffffff');
      drawCenteredText(ctx, '诚邀您见证我们的幸福时刻', 1080, '26px sans-serif', '#ffffff');
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  async function renderResults() {
    const groomName = el.groomName.value.trim();
    const brideName = el.brideName.value.trim();
    const dateText = formatDate(el.weddingDate.value);
    const copy = styleText(state.style);

    el.resultNames.textContent = `${groomName} & ${brideName}`;
    el.resultDate.textContent = dateText;
    el.resultGroom.src = state.groomPhoto;
    el.resultBride.src = state.bridePhoto;
    el.resultLine.textContent = copy.line;
    el.shareText.textContent = `${groomName}与${brideName}将于${dateText}举行婚礼。${copy.share}`;

    const titles = ['双人主视觉', '法式浪漫写真', '杂志登记照', '婚礼现场海报', '朋友圈官宣图'];
    el.generatedGrid.innerHTML = '';

    for (let index = 0; index < titles.length; index += 1) {
      const imageUrl = await makePoster(index, groomName, brideName, dateText);
      const item = document.createElement('article');
      item.className = 'generated-item';
      item.innerHTML = `
        <img src="${imageUrl}" alt="${titles[index]}" />
        <div class="generated-meta">
          <strong>${String(index + 1).padStart(2, '0')} · ${titles[index]}</strong>
          <button type="button">保存图片</button>
        </div>
      `;
      item.querySelector('button').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `婚礼视觉-${index + 1}.jpg`;
        link.click();
      });
      el.generatedGrid.appendChild(item);
    }
  }

  async function startGeneration() {
    el.formError.textContent = '';
    const groomName = el.groomName.value.trim();
    const brideName = el.brideName.value.trim();

    if (!state.groomPhoto || !state.bridePhoto) {
      el.formError.textContent = '请先上传新郎和新娘照片';
      return;
    }
    if (!groomName || !brideName) {
      el.formError.textContent = '请填写新郎和新娘姓名';
      return;
    }
    if (!el.weddingDate.value) {
      el.formError.textContent = '请选择婚礼日期';
      return;
    }

    el.generateButton.disabled = true;
    el.creatorCard.hidden = true;
    el.resultWrap.hidden = true;
    el.loadingCard.hidden = false;
    el.loadingBar.style.width = '10%';
    el.loadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const steps = [
      ['正在读取新人照片...', '25%'],
      ['正在生成婚礼主视觉...', '50%'],
      ['正在排版五张婚礼写真...', '75%'],
      ['正在整理请帖文案...', '92%']
    ];

    for (const [message, progress] of steps) {
      el.loadingMessage.textContent = message;
      el.loadingBar.style.width = progress;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      await renderResults();
      el.loadingBar.style.width = '100%';
      await new Promise(resolve => setTimeout(resolve, 250));
      el.loadingCard.hidden = true;
      el.resultWrap.hidden = false;
      el.resultWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      el.loadingCard.hidden = true;
      el.creatorCard.hidden = false;
      el.formError.textContent = '生成失败，请重新选择照片后再试';
    } finally {
      el.generateButton.disabled = false;
    }
  }

  el.generateButton.addEventListener('click', startGeneration);

  el.editAgain.addEventListener('click', () => {
    el.resultWrap.hidden = true;
    el.creatorCard.hidden = false;
    el.creatorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  el.copyText.addEventListener('click', async () => {
    const text = el.shareText.textContent;
    try {
      await navigator.clipboard.writeText(text);
      el.copyText.textContent = '已复制';
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      el.copyText.textContent = '已复制';
    }
    setTimeout(() => {
      el.copyText.textContent = '复制请帖文案';
    }, 1500);
  });
});
