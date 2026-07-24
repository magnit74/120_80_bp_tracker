import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), systolic: 120, diastolic: 80, status: "Normal")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        // Here we will eventually read from AppGroup UserDefaults
        let entry = SimpleEntry(date: Date(), systolic: 120, diastolic: 80, status: "Normal")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = SimpleEntry(date: Date(), systolic: 120, diastolic: 80, status: "Normal")
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let systolic: Int
    let diastolic: Int
    let status: String
}

struct BloodPressureWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(spacing: 4) {
            Text("LATEST READING")
                .font(.system(size: 10, weight: .semibold, design: .default))
                .foregroundColor(.gray)
                .tracking(1)
            
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text("\(entry.systolic)")
                    .font(.system(size: 32, weight: .bold, design: .default))
                    .foregroundColor(Color(red: 28/255, green: 28/255, blue: 30/255))
                Text("/")
                    .font(.system(size: 24, weight: .light, design: .default))
                    .foregroundColor(.gray)
                Text("\(entry.diastolic)")
                    .font(.system(size: 32, weight: .bold, design: .default))
                    .foregroundColor(Color(red: 28/255, green: 28/255, blue: 30/255))
            }
            
            Text(entry.status)
                .font(.system(size: 12, weight: .semibold, design: .default))
                .foregroundColor(Color(red: 15/255, green: 118/255, blue: 110/255))
        }
        .padding()
    }
}

@main
struct BloodPressureWidget: Widget {
    let kind: String = "BloodPressureWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            BloodPressureWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("120/80 Tracker")
        .description("Your latest blood pressure at a glance.")
    }
}
