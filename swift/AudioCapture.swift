import Foundation
import ScreenCaptureKit
import AVFoundation
import CoreMedia

class AudioCaptureDelegate: NSObject, SCStreamOutput, SCStreamDelegate {
    let assetWriter: AVAssetWriter
    let audioInput: AVAssetWriterInput
    var started = false

    init(outputURL: URL) throws {
        assetWriter = try AVAssetWriter(outputURL: outputURL, fileType: .m4a)

        let audioSettings: [String: Any] = [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 2,
            AVEncoderBitRateKey: 128000,
        ]
        audioInput = AVAssetWriterInput(mediaType: .audio, outputSettings: audioSettings)
        audioInput.expectsMediaDataInRealTime = true
        assetWriter.add(audioInput)

        super.init()
    }

    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio else { return }
        guard CMSampleBufferDataIsReady(sampleBuffer) else { return }

        if !started {
            assetWriter.startWriting()
            assetWriter.startSession(atSourceTime: CMSampleBufferGetPresentationTimeStamp(sampleBuffer))
            started = true
        }

        if audioInput.isReadyForMoreMediaData {
            audioInput.append(sampleBuffer)
        }
    }

    func finalize() async {
        audioInput.markAsFinished()
        await assetWriter.finishWriting()
    }
}

@available(macOS 13.0, *)
func captureAudio(appName: String, duration: Double, outputPath: String) async throws {
    let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)

    guard let targetApp = content.applications.first(where: { $0.applicationName == appName }) else {
        fputs("Error: Application '\(appName)' not found\n", stderr)
        exit(1)
    }

    let appFilter = SCContentFilter(display: content.displays[0], including: [targetApp], exceptingWindows: [])

    let config = SCStreamConfiguration()
    config.capturesAudio = true
    config.excludesCurrentProcessAudio = true
    config.width = 2
    config.height = 2
    config.minimumFrameInterval = CMTime(value: 1, timescale: 1)
    config.sampleRate = 44100
    config.channelCount = 2

    let outputURL = URL(fileURLWithPath: outputPath)

    if FileManager.default.fileExists(atPath: outputPath) {
        try FileManager.default.removeItem(at: outputURL)
    }

    let delegate = try AudioCaptureDelegate(outputURL: outputURL)
    let stream = SCStream(filter: appFilter, configuration: config, delegate: delegate)
    try stream.addStreamOutput(delegate, type: .audio, sampleHandlerQueue: .main)

    try await stream.startCapture()
    fputs("Capturing audio for \(duration) seconds...\n", stderr)

    try await Task.sleep(nanoseconds: UInt64(duration * 1_000_000_000))

    try await stream.stopCapture()
    await delegate.finalize()
    fputs("Audio capture complete: \(outputPath)\n", stderr)
}

let args = CommandLine.arguments
var appName = "Music"
var duration: Double = 30
var outputPath = "output.m4a"

var i = 1
while i < args.count {
    switch args[i] {
    case "--app-name":
        i += 1; appName = args[i]
    case "--duration":
        i += 1; duration = Double(args[i]) ?? 30
    case "--output":
        i += 1; outputPath = args[i]
    default:
        break
    }
    i += 1
}

if #available(macOS 13.0, *) {
    let semaphore = DispatchSemaphore(value: 0)
    Task {
        do {
            try await captureAudio(appName: appName, duration: duration, outputPath: outputPath)
        } catch {
            fputs("Error: \(error.localizedDescription)\n", stderr)
            exit(1)
        }
        semaphore.signal()
    }
    semaphore.wait()
} else {
    fputs("Error: macOS 13.0+ required for ScreenCaptureKit\n", stderr)
    exit(1)
}
