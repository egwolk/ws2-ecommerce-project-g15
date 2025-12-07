class SimpleBarChart extends HTMLElement {
  connectedCallback() {
    const labels = this.getAttribute('labels');
    const data = this.getAttribute('data');
    let labelArr = [];
    let dataArr = [];
    try { labelArr = JSON.parse(labels || '[]'); } catch {}
    try { dataArr = JSON.parse(data || '[]').map(Number); } catch {}
    const width = Number(this.getAttribute('width') || 600);
    const height = Number(this.getAttribute('height') || 300);
    const bg = this.getAttribute('bg') || '#fff';
    const color = this.getAttribute('color') || '#1e88e5';
    const type = (this.getAttribute('type') || 'bar').toLowerCase();
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.style.display = 'block';
    canvas.style.background = bg;
    canvas.style.border = '1px solid #ccc';
    this.innerHTML = '';
    this.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    // Draw axes
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, height - 30);
    ctx.lineTo(width - 10, height - 30);
    ctx.stroke();
    // Compute scaling
    const maxVal = dataArr.length ? Math.max(...dataArr) : 0;
    const chartW = width - 60;
    const chartH = height - 50;
    const count = dataArr.length || 1;
    const scaleY = maxVal > 0 ? chartH / maxVal : 0;

    if (type === 'line') {
      // Draw line chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const val = dataArr[i] || 0;
        const x = 50 + (count === 1 ? chartW/2 : (chartW * i) / (count - 1));
        const y = height - 30 - (val * scaleY);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Draw points and x labels
      for (let i = 0; i < count; i++) {
        const val = dataArr[i] || 0;
        const x = 50 + (count === 1 ? chartW/2 : (chartW * i) / (count - 1));
        const y = height - 30 - (val * scaleY);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(labels && labelArr[i] || ''), x, height - 15);
      }
    } else {
      // Draw bars
      const barW = Math.max(10, Math.floor(chartW / count * 0.7));
      const gap = Math.max(5, Math.floor(chartW / count * 0.3));
      ctx.fillStyle = color;
      let x = 50;
      for (let i = 0; i < count; i++) {
        const val = dataArr[i] || 0;
        const h = val * scaleY;
        const y = height - 30 - h;
        ctx.fillRect(x, y, barW, h);
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(labels && labelArr[i] || ''), x + barW/2, height - 15);
        ctx.fillStyle = color;
        x += barW + gap;
      }
    }
    // Title
    const title = this.getAttribute('title') || '';
    if (title) {
      ctx.fillStyle = '#333';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, 45, 20);
    }
  }
}
customElements.define('simple-bar-chart', SimpleBarChart);