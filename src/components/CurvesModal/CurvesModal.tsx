import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, InputNumber } from 'antd';
import Chart from 'chart.js/auto';
import { ImageData } from '../../App';
import './CurvesModal.css';

export interface CurvesModalProps {
  image: ImageData;
  onGammaCorrectionChange: (data: string) => void;
}

interface ColorHistogramData {
  r: number[];
  g: number[];
  b: number[];
}

const CurvesModal = ({
  image,
  onGammaCorrectionChange,
}: CurvesModalProps) => {
  const [curvePoints, setCurvePoints] = useState({
    enter: { in: 0, out: 0 },
    exit: { in: 255, out: 255 },
  });
  const [isPreview, setIsPreview] = useState(false);
  const [histogramData, setHistogramData] = useState<ColorHistogramData | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const histData = getColorsHistData();
    setHistogramData(histData);
  }, []);

  useEffect(() => {
    if (isPreview) {
      generatePreview();
    }
  }, [curvePoints, isPreview]);

  useEffect(() => {
    if (histogramData) {
      renderChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histogramData, curvePoints]);

  const getColorsHistData = (): ColorHistogramData => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      return { r: [], g: [], b: [] };
    }
    tempCtx.drawImage(image.imageElement, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, image.width, image.height).data;

    const histData: ColorHistogramData = {
      r: new Array(256).fill(0),
      g: new Array(256).fill(0),
      b: new Array(256).fill(0),
    };

    for (let i = 0; i < imageData.length; i += 4) {
      histData.r[imageData[i]]++;
      histData.g[imageData[i + 1]]++;
      histData.b[imageData[i + 2]]++;
    }

    return histData;
  };

  const renderChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const data = {
      labels: Array.from({ length: 256 }, (_, i) => i),
      datasets: [
        {
          label: 'Red',
          data: histogramData!.r,
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          borderWidth: 0,
          type: 'bar' as const,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
        {
          label: 'Green',
          data: histogramData!.g,
          backgroundColor: 'rgba(0, 255, 0, 0.5)',
          borderWidth: 0,
          type: 'bar' as const,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
        {
          label: 'Blue',
          data: histogramData!.b,
          backgroundColor: 'rgba(0, 0, 255, 0.5)',
          borderWidth: 0,
          type: 'bar' as const,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
        {
          label: 'Curve',
          data: Array.from({ length: 256 }, (_, x) => {
            const x1 = curvePoints.enter.in;
            const y1 = curvePoints.enter.out;
            const x2 = curvePoints.exit.in;
            const y2 = curvePoints.exit.out;
            const a = (y2 - y1) / (x2 - x1);
            const b = y1 - a * x1;

            if (x <= x1) return y1;
            if (x >= x2) return y2;
            return a * x + b;
          }),
          type: 'line' as const,
          borderColor: 'black',
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          yAxisID: 'y1',
        },
      ],
    };

    const options = {
      scales: {
        x: {
          display: false, // Убираем подписи на оси X
          min: 0,
          max: 255,
        },
        y: {
          display: false, // Убираем подписи на оси Y
          min: 0,
          max: Math.max(...histogramData!.r, ...histogramData!.g, ...histogramData!.b) * 1.1, // Немного увеличиваем максимальное значение для визуализации
        },
        y1: {
          type: 'linear' as const,
          display: false,
          position: 'right' as const,
          min: 0,
          max: 255,
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      // animation: false,
    };

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: options,
    });
  };

  const generatePreview = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(image.imageElement, 0, 0);
    const srcImageData = tempCtx.getImageData(0, 0, image.width, image.height);
    const data = srcImageData.data;

    const x1 = curvePoints.enter.in;
    const y1 = curvePoints.enter.out;
    const x2 = curvePoints.exit.in;
    const y2 = curvePoints.exit.out;

    const a = (y2 - y1) / (x2 - x1);
    const b = y1 - a * x1;

    const applyCurve = (value: number) => {
      if (value <= x1) {
        return y1;
      } else if (value >= x2) {
        return y2;
      } else {
        return a * value + b;
      }
    };

    for (let i = 0; i < data.length; i += 4) {
      data[i] = applyCurve(data[i]);       // R
      data[i + 1] = applyCurve(data[i + 1]); // G
      data[i + 2] = applyCurve(data[i + 2]); // B
      // Alpha channel remains the same
    }

    tempCtx.putImageData(srcImageData, 0, 0);
    const dataUrl = tempCanvas.toDataURL();
    setPreviewImageUrl(dataUrl);
  };

  const changeGammaCorrection = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(image.imageElement, 0, 0);
    const srcImageData = tempCtx.getImageData(0, 0, image.width, image.height);
    const data = srcImageData.data;

    const x1 = curvePoints.enter.in;
    const y1 = curvePoints.enter.out;
    const x2 = curvePoints.exit.in;
    const y2 = curvePoints.exit.out;

    const a = (y2 - y1) / (x2 - x1);
    const b = y1 - a * x1;

    const applyCurve = (value: number) => {
      if (value <= x1) {
        return y1;
      } else if (value >= x2) {
        return y2;
      } else {
        return a * value + b;
      }
    };

    for (let i = 0; i < data.length; i += 4) {
      data[i] = applyCurve(data[i]);       // R
      data[i + 1] = applyCurve(data[i + 1]); // G
      data[i + 2] = applyCurve(data[i + 2]); // B
      // Alpha channel remains the same
    }

    tempCtx.putImageData(srcImageData, 0, 0);
    const dataUrl = tempCanvas.toDataURL();
    onGammaCorrectionChange(dataUrl);
  };

  const changeCurvePoints = (
    value: number,
    point: 'enter' | 'exit',
    pointParam: 'in' | 'out'
  ) => {
    setCurvePoints((prev) => ({
      ...prev,
      [point]: {
        ...prev[point],
        [pointParam]: value,
      },
    }));
  };

  return (
    <div className="curves-modal">
      <canvas ref={chartRef} width={400} height={400} />
      <div className="curves-inputs">
        <div className="curves-input">
          <p className="curves-input-label">In</p>
          <InputNumber
            min={0}
            max={255}
            value={curvePoints.enter.in}
            onChange={(value) => changeCurvePoints(value || 0, 'enter', 'in')}
            placeholder="In"
          />
          <p className="curves-input-label">Out</p>
          <InputNumber
            min={0}
            max={255}
            value={curvePoints.enter.out}
            onChange={(value) => changeCurvePoints(value || 0, 'enter', 'out')}
            placeholder="Out"
          />
        </div>
        <div className="curves-input">
          <p className="curves-input-label">In</p>
          <InputNumber
            min={0}
            max={255}
            value={curvePoints.exit.in}
            onChange={(value) => changeCurvePoints(value || 0, 'exit', 'in')}
            placeholder="In"
          />
          <p className="curves-input-label">Out</p>
          <InputNumber
            min={0}
            max={255}
            value={curvePoints.exit.out}
            onChange={(value) => changeCurvePoints(value || 0, 'exit', 'out')}
            placeholder="Out"
          />
        </div>
      </div>
      {isPreview && previewImageUrl && (
        <div className="preview">
          <img src={previewImageUrl} alt="Preview" style={{ maxWidth: '100%' }} />
        </div>
      )}
      <div className="curves-btns">
        <Button
          type="primary"
          onClick={() => {
            changeGammaCorrection();
          }}
        >
          Изменить
        </Button>
        <Checkbox
          checked={isPreview}
          onChange={() => setIsPreview(!isPreview)}
        >
          Предпросмотр
        </Checkbox>
      </div>
    </div>
  );
};

export default CurvesModal;
