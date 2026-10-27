import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import StatusMessage from "../components/StatusMessage";

const accepted = ["application/pdf", "image/jpeg", "image/png"];

export default function UploadArea() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function addFiles(incoming: FileList | File[]) {
    setError("");
    const selected = Array.from(incoming);
    const invalid = selected.filter((f) => !accepted.includes(f.type));
    if (invalid.length) {
      setError("Only PDF, JPG/JPEG and PNG files are supported.");
    }
    const valid = selected.filter((f) => accepted.includes(f.type));
    setFiles((current) => [...current, ...valid].slice(0, 20));
  }

  async function upload() {
    if (!files.length) {
      setError("Select at least one report first.");
      return;
    }
    setProcessing(true);
    setMessage("");
    setError("");
    try {
      const result = await api.uploadReports(files);
      const summary = result?.summary || result?.data?.summary || "Your report has been uploaded and sent for processing.";
      setMessage(summary);
      setFiles([]);
      window.dispatchEvent(new Event("health_data_updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Check that the backend is running.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <span className="eyebrow">FEATURES 4–8</span>
        <h2>Upload medical reports</h2>
        <p>Upload one report or multiple reports. Supported: PDF, JPG and PNG, including scanned/photo-based documents.</p>
      </div>

      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {message && (
        <div style={{ margin: "14px 0" }}>
          <StatusMessage type="success">{message}</StatusMessage>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <Link to="/reports" className="primary-button">
              View Reports Archive →
            </Link>
            <Link to="/" className="secondary-button">
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}

      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <div className="upload-icon">↑</div>
        <h3>Drag & drop your reports here</h3>
        <p>or choose files from your computer</p>
        <button className="primary-button" onClick={() => inputRef.current?.click()}>
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <small>Up to 20 files • PDF, JPG, PNG</small>
      </div>

      {files.length > 0 && (
        <div className="card">
          <div className="row-between">
            <h3>Selected files ({files.length})</h3>
            <button className="text-button" onClick={() => setFiles([])}>Clear all</button>
          </div>
          <div className="file-list">
            {files.map((file, i) => (
              <div className="file-row" key={`${file.name}-${i}`}>
                <span>{file.name}</span>
                <button className="remove-button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
          </div>
          <button className="primary-button wide" disabled={processing} onClick={upload}>
            {processing ? "Processing…" : "Upload & process reports"}
          </button>
        </div>
      )}

      <div className="grid three">
        <div className="mini-card"><strong>1</strong><span>Upload</span><small>Select your report.</small></div>
        <div className="mini-card"><strong>2</strong><span>Process</span><small>Backend extracts and simplifies it.</small></div>
        <div className="mini-card"><strong>3</strong><span>Understand</span><small>View the simplified result.</small></div>
      </div>
    </section>
  );
}