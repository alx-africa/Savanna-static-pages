from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="InkluBot AI Service")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


class AskRequest(BaseModel):
    question: str
    language: str = "en"
    channel: str = "telegram"


@app.get("/")
async def home():
    return {
        "service": "InkluBot AI Service",
        "status": "running"
    }


@app.post("/api/ask")
async def ask(request: AskRequest):
    question = request.question.lower()
    language = request.language

    if (
        "course" in question
        or "ኮርስ" in question
        or "ትምህርት" in question
        or "qopheessaa" in question
        or "barattoota" in question
        or "ትምህርቲ" in question
        or "koorso" in question
        or "kursi" in question
    ):
        if language == "am":
            answer = (
                "የሚገኙ ኮርሶች:\n"
                "• ዲጂታል ማርኬቲንግ\n"
                "• የኮምፒውተር መሰረታዊ ክህሎት\n"
                "• የደንበኞች አገልግሎት\n"
                "• ግራፊክ ዲዛይን\n"
                "• ድህረ ገጽ ልማት\n\n"
                "የትኛውን ኮርስ ማወቅ ይፈልጋሉ?"
            )

        elif language == "om":
            answer = (
                "Kursawwan argamu:\n"
                "• Marketing Dijitaalaa\n"
                "• Beekumsa Kompiitaraa Bu’uuraa\n"
                "• Tajaajila Maamila\n"
                "• Design Graafikaa\n"
                "• Misooma Web\n\n"
                "Kursa kam irratti beekuu barbaadda?"
            )

        elif language == "ti":
            answer = (
                "እንታይ ትምህርቲ ኣሎ:\n"
                "• ዲጂታል ማርኬቲንግ\n"
                "• መሰረታዊ ክእለት ኮምፒዩተር\n"
                "• ተርእሶ ደንበኛ\n"
                "• ግራፊክ ዲዛይን\n"
                "• ምምዕባል ድሕረ ገጽ\n\n"
                "እንታይ ትምህርቲ ክትፈልጦ ትደሊ?"
            )

        elif language == "so":
            answer = (
                "Koorsooyinka la heli karo:\n"
                "• Suuqgeynta Dhijitaalka ah\n"
                "• Xirfadaha Aasaasiga ah ee Kombuyuutarka\n"
                "• Adeegyada Macmiilka\n"
                "• Naqshadda Graafiga\n"
                "• Horumarinta Shabakada\n\n"
                "Koorsekee ayaad ka badan tahay inaad wax ka ogaato?"
            )

        elif language == "aa":
            answer = (
                "Kursiyoonih tan:\n"
                "• Marketing dijitalah\n"
                "• Kompiiterra aayro takkoy\n"
                "• Kren-hinnah tan\n"
                "• Graafik dizayn\n"
                "• Web abna\n\n"
                "Ma takkay kursih tan baxsaa?"
            )

        else:
            answer = (
                "Available courses include:\n"
                "• Digital Marketing\n"
                "• Basic Computer Skills\n"
                "• Customer Service\n"
                "• Graphic Design\n"
                "• Web Development\n\n"
                "Which course would you like to know more about?"
            )

    elif (
        "job" in question
        or "ሥራ" in question
        or "ስራ" in question
        or "addis ababa" in question
        or "hojii" in question
        or "shaqo" in question
        or "hinnah" in question
    ):
        if language == "am":
            answer = (
                "በአዲስ አበባ የሚገኙ የሥራ ዕድሎች:\n"
                "• የደንበኞች አገልግሎት ተቆጣጣሪ\n"
                "• የመረጃ ግቤት ሠራተኛ\n"
                "• የሽያጭ አማካሪ\n"
                "• የአስተዳደር አማካሪ\n"
                "• የዲጂታል ማርኬቲንግ አማካሪ\n\n"
                "የሥራ ዝርዝር፣ ስዕል ወይም የቃለ መጠይቅ ምክር ይፈልጋሉ?"
            )

        elif language == "om":
            answer = (
                "Kan Addis Ababa keessa jiran:\n"
                "• Bakka Bu'aa Tajaajila Maamila\n"
                "• Ogeessa Galmeessuu Deetaa\n"
                "• Gargaaraa Gurgurtaa\n"
                "• Gargaaraa Bulchiinsaa\n"
                "• Gargaaraa Marketing Dijitaalaa\n\n"
                "Tarreessii hojii, qopheessaa, ykn gorsa "
                "gaaffii gaafachuu barbaaddaa?"
            )

        elif language == "ti":
            answer = (
                "ኣብ ኣዲስ ኣበባ ዝርከቡ ስራሕ:\n"
                "• ተኸላላፊ ተርእሶ ደንበኛ\n"
                "• ሰራሕተኛ መዝገብ ሓበሬታ\n"
                "• ሓጋዚ ዕዳጋ\n"
                "• ሓጋዚ ምሕደራ\n"
                "• ሓጋዚ ዲጂታል ማርኬቲንግ\n\n"
                "መርኸብ ስራሕ፣ ትምህርቲ ወይ ምክር ቃለ መጠይቅ ተደሊ?"
            )

        elif language == "so":
            answer = (
                "Fursadaha shaqada ee Addis Ababa:\n"
                "• Wakiilka Adeegyada Macmiilka\n"
                "• Qoraha Gelinta Xogta\n"
                "• Kaaliyaha Iibka\n"
                "• Kaaliyaha Maamulka\n"
                "• Kaaliyaha Suuqgeynta Dhijitaalka ah\n\n"
                "Ma rabtaa liiska shaqooyinka, tababar, ama "
                "talooyinka wareegga shaqada?"
            )

        elif language == "aa":
            answer = (
                "Addis Ababa hinnah tan:\n"
                "• Kren-hinnah tan\n"
                "• Data gelik tan\n"
                "• Gaddi tan\n"
                "• Maamul tan\n"
                "• Marketing dijital tan\n\n"
                "Ma rabtaa tan, kursi, kee garab tan?"
            )

        else:
            answer = (
                "Job opportunities in Addis Ababa include:\n"
                "• Customer Service Representative\n"
                "• Data Entry Clerk\n"
                "• Sales Assistant\n"
                "• Administrative Assistant\n"
                "• Digital Marketing Assistant\n\n"
                "Would you like job listings, training, or interview tips?"
            )

    elif "accommodation" in question:
        answer = (
            "Available interview accommodations include:\n"
            "• Extra time\n"
            "• Screen reader support\n"
            "• Sign language interpretation\n"
            "• Quiet interview room\n"
            "• Written questions\n"
            "• Remote interview"
        )

    else:
        if language == "am":
            answer = (
                "እርዳታ ማግኘት እችላለሁ በ፡\n"
                "• ኮርሶች\n"
                "• ሥራ ዕድሎች\n"
                "• የቃለ መጠይቅ ድጋፍ\n\n"
                "እባክዎ ከእነዚህ መካከል ይጠይቁ።"
            )

        elif language == "om":
            answer = (
                "Gargaarsa koo:\n"
                "• Kursa\n"
                "• Hojii\n"
                "• Gaaffii gaafachuu\n\n"
                "Maaloo waan tokko irraa gaafadhu."
            )

        elif language == "ti":
            answer = (
                "ሓገዝ ክህበኩም እችል ብ፡\n"
                "• ትምህርቲ\n"
                "• ስራሕ\n"
                "• ሓገዝ ቃለ መጠይቅ\n\n"
                "ካብዚ ሓላፊ ሕቶ ኣብዚሑሉ።"
            )

        elif language == "so":
            answer = (
                "Waxaan kaa caawin karaa:\n"
                "• Koorsooyinka\n"
                "• Shaqooyinka\n"
                "• Caawinta wareegga shaqada\n\n"
                "Fadlan weydii mid ka mid ah."
            )

        elif language == "aa":
            answer = (
                "Tan garsissu manna:\n"
                "• Kursi\n"
                "• Hinnah\n"
                "• Garab tan\n\n"
                "Maanu takkay weeri."
            )

        else:
            answer = (
                "I can help you find courses, jobs, or interview "
                "accommodations.\n"
                "Please ask about one of these topics."
            )

    return {
        "answer": answer,
        "language": language,
        "channel": request.channel
    }