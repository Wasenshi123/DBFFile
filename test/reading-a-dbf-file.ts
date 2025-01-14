import {expect} from 'chai';
import {DBFFile, OpenOptions, DELETED} from 'dbffile';
import * as path from 'path';




describe('Reading a DBF file', () => {

    interface Test {

        /** Test description. */
        description: string;

        /** The name of the DBF file fixture to read (not the full path). */
        filename: string;

        /** The options to use when opening the DBF file. */
        options?: OpenOptions;

        /** The expected number of records in the file. Leave undefined if `error` is defined. */
        recordCount?: number;

        /** The expected date of last update. Leave undefined if `error` is defined. */
        dateOfLastUpdate?: Date;

        /** The number of records to read for the test. Default is to read all records. Affects expected values below. */
        numberOfRecordsToRead?: number;

        /** Expected field values in the first record. Leave undefined if `error` is defined. */
        firstRecord?: Record<string, unknown> & {[DELETED]?: true};

        /** Expected field values in the last record. Leave undefined if `error` is defined. */
        lastRecord?: Record<string, unknown> & {[DELETED]?: true};

        /** Expected count of deleted records in the file. Leave undefined if `error` is defined. */
        deletedCount?: number;

        /** Expected error message, if any, when attempting to open/read the file. */
        error?: string;
    }

    let tests: Test[] = [
        {
            description: 'DBF with default encoding',
            filename: 'PYACFL.DBF',
            recordCount: 45,
            dateOfLastUpdate: new Date('2014-04-14'),
            firstRecord: {AFCLPD: 'W', AFHRPW: 2.92308, AFLVCL: 0.00, AFCRDA: new Date('1999-03-25'), AFPSDS: ''},
            lastRecord: {AFCLPD: 'W', AFHRPW: 0, AFLVCL: 0.00, AFCRDA: new Date('1991-04-15'), AFPSDS: ''},
            deletedCount: 30,
        },
        {
            description: 'DBF with duplicated field name',
            filename: 'dbase_03.dbf',
            error: `Duplicate field name: 'Point_ID'`
        },
        {
            description: 'DBF stored with non-default encoding, read using default encoding',
            filename: 'WSPMST.DBF',
            recordCount: 6802,
            dateOfLastUpdate: new Date('1919-05-03'),
            firstRecord: {DISPNAME: 'ÃÍ§à·éÒºØÃØÉADDA 61S02-M1', GROUP: '5', LEVEL: 'N'},
            lastRecord: {DISPNAME: '', GROUP: 'W', LEVEL: 'S'},
            deletedCount: 5,
        },
        {
            description: 'DBF stored with non-default encoding, read using correct encoding',
            filename: 'WSPMST.DBF',
            options: {encoding: 'tis620'},
            recordCount: 6802,
            dateOfLastUpdate: new Date('1919-05-03'),
            firstRecord: {DISPNAME: 'รองเท้าบุรุษADDA 61S02-M1', PNAME: 'รองเท้า CASUAL', GROUP: '5', LEVEL: 'N'},
            lastRecord: {DISPNAME: '', PNAME: 'รองเท้า B-GRADE', GROUP: 'W', LEVEL: 'S'},
            deletedCount: 5,
        },
        {
            description: 'DBF read with multiple field-specific encodings',
            filename: 'WSPMST.DBF',
            options: {encoding: {default: 'tis620', PNAME: 'latin1'}},
            recordCount: 6802,
            dateOfLastUpdate: new Date('1919-05-03'),
            firstRecord: {DISPNAME: 'รองเท้าบุรุษADDA 61S02-M1', PNAME: 'ÃÍ§à·éÒ CASUAL'},
            lastRecord: {DISPNAME: '', PNAME: 'ÃÍ§à·éÒ B-GRADE'},
            deletedCount: 5,
        },
        {
            description: 'DBF with memo file (version 0x83)',
            filename: 'dbase_83.dbf',
            recordCount: 67,
            dateOfLastUpdate: new Date('2003-12-18'),
            firstRecord: {
                ID: 87,
                CODE: '1',
                NAME: 'Assorted Petits Fours',
                WEIGHT: 5.51,
                DESC: `Our Original assortment...a little taste of heaven for everyone.  Let us
                select a special assortment of our chocolate and pastel favorites for you.
                Each petit four is its own special hand decorated creation. Multi-layers of
                moist cake with combinations of specialty fillings create memorable cake
                confections. Varietes include; Luscious Lemon, Strawberry Hearts, White
                Chocolate, Mocha Bean, Roasted Almond, Triple Chocolate, Chocolate Hazelnut,
                Grand Orange, Plum Squares, Milk chocolate squares, and Raspberry Blanc.`.replace(/[\r\n]+\s*/g, '\r\n')
            },
            lastRecord: {
                ID: 94,
                CODE: 'BD02',
                NAME: 'Trio of Biscotti',
                WEIGHT: 0,
                DESC: 'This tin is filled with a tempting trio of crunchy pleasures that can be enjoyed by themselves or dunked into fresh cup of coffee. Our perennial favorite Biscotti di Divine returns, chockfull of toasted almonds, flavored with a hint of cinnamon, and half dipped into bittersweet chocolate. Two new twice-baked delights make their debut this season; Heavenly Chocolate Hazelnut and Golden Orange Pignoli. 16 biscotti are packed in a tin.  (1Lb. 2oz.)'
            },
            deletedCount: 0,
        },
        {
            description: 'DBF with memo file (version 0x8b)',
            filename: 'dbase_8b.dbf',
            recordCount: 10,
            dateOfLastUpdate: new Date('2000-06-12'),
            firstRecord: {
                CHARACTER: 'One',
                NUMERICAL: 1,
                LOGICAL: true,
                FLOAT: 1.23456789012346,
                MEMO: 'First memo\r\n'
            },
            lastRecord: {
                CHARACTER: 'Ten records stored in this database',
                NUMERICAL: 10,
                DATE: null,
                LOGICAL: null,
                FLOAT: 0.1,
                MEMO: null
            },
            deletedCount: 0,
        },
        {
            description: 'VFP9 DBF without memo file (version 0x30)',
            filename: 'vfp9_30.dbf',
            recordCount: 3,
            dateOfLastUpdate: new Date('1919-11-06'),
            firstRecord: {
                FIELD1: 'carlos manuel',
                FIELD2: new Date('2013-12-12'),
                FIELD3: new Date('2013-12-12 08:30:00 GMT'),
                FIELD4: 17000000000,
                FIELD5: 2500.55,
                FIELD6: true,
            },
            lastRecord: {
                FIELD1: 'ricardo enrique',
                FIELD2: new Date('2017-08-07'),
                FIELD3: new Date('2017-08-07 20:30:00 GMT'),
                FIELD4: 17000000000,
                FIELD5: 2500.45,
                FIELD6: true,
            },
            deletedCount: 1,
        },
        {
            description: 'VFP9 DBF with memo file (version 0x30)',
            filename: 'vfp9_30_memo.dbf',
            recordCount: 3,
            dateOfLastUpdate: new Date('1921-10-12'),
            firstRecord: {
                ID: 1,
                MEMO: 'Memo of record 1. Which needs to be very long to be bigger than 64 bytes and take 2 memo blocks',
                CHAR: 'Text1',
                NUM: 999.50,
                DATE: new Date('2021-10-11'),
                TIME: new Date('2021-10-11 22:34:50 GMT'),
            },
            lastRecord: {
                ID: 3,
                MEMO: 'Memo of record 3',
                CHAR: 'Text3',
                NUM: 10.11,
                DATE: new Date('2020-01-01'),
                TIME: new Date('2020-01-01 12:12:12 GMT'),
            },
            deletedCount: 1,
        },
        {
            description: `DBF with unsupported file version and field types in 'strict' (default) read mode`,
            filename: 'dbase_31.dbf',
            error: 'unknown/unsupported dBase version: 49',
        },
        {
            description: `DBF with unsupported file version and field types in 'loose' read mode`,
            filename: 'dbase_31.dbf',
            options: {readMode: 'loose'},
            recordCount: 77,
            dateOfLastUpdate: new Date('1902-08-02'),
            firstRecord: {PRODUCTID: 1, PRODUCTNAM: 'Chai', REORDERLEV: 10, DISCONTINU: false},
            lastRecord: {PRODUCTID: 77, PRODUCTNAM: 'Original Frankfurter grüne Soáe', REORDERLEV: 15, DISCONTINU: false},
            deletedCount: 0,
        },
        {
            description: `DBF with missing memo file in 'strict' (default) read mode`,
            filename: 'dbase_8b_missing_memo.dbf',
            error: `Memo file not found`,
        },
        {
            description: `DBF with missing memo file in 'loose' read mode`,
            filename: 'dbase_8b_missing_memo.dbf',
            options: {readMode: 'loose'},
            recordCount: 10,
            dateOfLastUpdate: new Date('2000-06-12'),
            firstRecord: {NUMERICAL: 1, LOGICAL: true, FLOAT: 1.23456789012346},
            lastRecord: {NUMERICAL: 10, DATE: null, LOGICAL: null, FLOAT: 0.1},
            deletedCount: 0,
        },
        {
            description: 'DBF with deleted records included in results',
            filename: 'PYACFL.DBF',
            options: {includeDeletedRecords: true},
            recordCount: 45,
            dateOfLastUpdate: new Date('2014-04-14'),
            firstRecord: {[DELETED]: true, AFCLPD: 'W', AFHRPW: 0, AFACCL: 'P', AFCRDA: new Date('1991-04-15'), AFPSDS: ''},
            lastRecord: {AFCLPD: 'W', AFHRPW: 0, AFLVCL: 0.00, AFCRDA: new Date('1991-04-15'), AFPSDS: ''},
            deletedCount: 0,
        },
        {
            description: `DBF with a multibyte character straddling two memo blocks`,
            filename: 'vfp_gb2312_memo.dbf',
            options: {readMode: 'loose', encoding: 'gb2312'},
            recordCount: 4247,
            dateOfLastUpdate: new Date('1902-12-18'),
            numberOfRecordsToRead: 13,
            firstRecord: {},
            lastRecord: {
                DOCID: 13,
                PARENTID: 5,
                YEAR: 1966,
                MONTH: 2,
                DAY: 12,
                TITLE: '中共中央批转文化革命五人小组关于当前学术讨论的汇报提纲',
                CONTENTS: '              中共中央批转文化革命五人小组关于当前学术讨论的汇报提纲\r\n                                   1966.02.12\r\n\r\n各中央局，各省、市、自治区党委，中央各部委，国家机关各部门党组、党委，总政治部：\r\n    中央同意文化革命五人小组关于当前学术讨论的汇报提纲。现将这个提纲发给你们，望照此执行。\r\n    这个提纲的内容，应当向党内主管学术讨论工作的同志，和从事学术研究工作的同志传达并组织讨论。在讨论时，应当把毛泽东同志一九五七年三月在中国共产党全国宣传工作会议上的讲话作为学习文件。\r\n          中    央\r\n          一九六六年二月十二日\r\n\r\n        五人小组向中央的汇报提纲\r\n        （一九六六年二月七日）\r\n\r\n    文化革命五人小组，二月三日开了一天会。参加人有彭真、定一、康生、冷西，以及许立群、胡绳、姚溱、王力、范若愚、刘仁、郑天翔。共十一个同志。\r\n    会上讨论的问题，及主要意见如下：\r\n    （一）目前学术批判的形势和性质\r\n    对吴晗同志《海瑞罢官》的批判，以及由此展开的关于道德继承、“清官”、“让步政策”、历史人物评价和历史研究的观点方法等问题的讨论，已使思想界活跃起来了，盖子揭开了，成绩很大。这场大辩论的性质，是马克思列宁主义、毛泽东思想同资产阶级思想在意识形态领域内的一场大斗争，是我国无产阶级取得政权并且实行社会主义革命后，在学术领域中清除资产阶级和其他反动或错误思想的斗争，是兴无灭资的斗争即社会主义及资本主义两条道路斗争中的一个组成部分。这场大辩论势必扩展到其它学术领域中去。我们要有领导地、认真地、积极地和谨慎地搞好这场斗争，打击资产阶级思想，巩固、扩大无产阶级的思想阵地，并且大大推动我们干部、学术工作者、广大工农群众对马克思列宁主义、毛泽东思想的学习，把他们的政治思想水平大大提高一步。\r\n    彻底清理学术领域内的资产阶级思想，是苏联和其他社会主义国家一直没有解决的问题。这里存在着一个谁领导谁、谁战胜谁的问题。我们要通过这场斗争，在毛泽东思想的指导下，开辟解决这个问题的道路，在边争、边学中锻炼出一支又红又专的学术队伍，并且逐步地系统地解决这方面的问题。\r\n    我们通过这场斗争和其他一系列工作（例如提倡工农兵学毛主席著作、工农兵学哲学等）不仅要进一步打破旧知识分子，实际是剥削阶级学术文化的垄断地位，而且要从此进入一个广大工农兵群众直接掌握马列主义、毛泽东思想的理论武器和科学文化的新的历史时期。当然，首先是从他们中间有相当文化水平的人开始，并且随着工农群众文化的普及提高而向前发展。\r\n    正因为如此，应当足够的估计到这场斗争的长期性、复杂性、艰巨性。要战略上藐视，战术上重视。要估计到这场斗争不是经过几个月，有几篇结论性文章，或者给某些被批评者做出政治结论，就可能完成这个任务的。我们应当积极地、认真地、不间断地把这场斗争长期坚持下去。\r\n    （二）方针\r\n    坚持毛泽东同志一九五七年三月在党的全国宣传工作会议上所讲的“放”的方针，也就是让各种不同意见（包括反马克思列宁主义的东西）都充分地放出来，在针锋相对的矛盾的斗争中，用摆事实、讲道理的方法，对反动或错误的思想加以分析批判，真正地驳倒或摧毁他们。\r\n    学术争论问题是很复杂的，有些事短时间内不容易完全弄清楚。我们在讨论中，要抓大是大非，首先要划清两个阶级（无产阶级和资产阶级）、两条道路（社会主义道路和资本主义道路）、两个主义（马列主义和反马列主义）的界限，并且弄清学术上带根本性的是非问题。要坚持实事求是，在真理面前人人平等的原则，要以理服人，不要像学阀一样武断和以势压人。要提倡“坚持真理、随时修正错误”。要有破有立（没有立，就不可能达到真正、彻底地破）。我们在斗争中，认真地、刻苦地学习毛泽东思想和进行学术研究，掌握大量资料，进行科学分析，把学术向前推进。就是说，我们不仅要在政治上压倒对方，而且要在学术和业务的水准上真正大大地超过和压倒对方。\r\n    只有这样，才有利于用无产阶级思想逐步地改造旧知识分子，提高革命的知识分子，团结大多数，反对少数，并且真正把极少数坚持不改、死抱住错误或反动观点不放的人孤立起来，逐步地摧毁反动的学术观点。\r\n    要准许和欢迎犯错误的人和学术观点反动的人自己改正错误。对他们要采取严肃和与人为善的态度，不要和稀泥，不要“不准革命”。不论他们是改还是不改，是真改还是假改，我们这样做，都比较有利。\r\n    对于吴晗这样用资产阶级世界观对待历史和犯有政治错误的人，在报刊上的讨论不要局限于政治问题，要把涉及到各种学术理论的问题，充分地展开讨论。如果最后还有不同意见，应当容许保留，以后继续讨论。这样，便于把各种意见放出来，并使我们的队伍在边争边学中成长、壮大起来。\r\n    报刊上公开点名作重点批判要慎重，有的人要经过有关领导机构批准。过去参加演坏戏的演员，不要叫他们在这次争论中在报刊上公开检讨，他们的错误可以在另外的场合解决。\r\n    工人日报、中国青年报、体育报等报刊，原则上都可以发表讨论文章或摘要、简介，但要注意质量，注意简洁明了。\r\n    （三）队伍\r\n    五人小组和各省、市、区党委都要抓紧革命的学术工作队伍。要依靠坚定的左派，团结一切革命的积极分子，孤立极少数顽固不化、坚持不改的人。\r\n    我们要边打边建，由少到多，逐步形成一支不但在政治上、而且在学术上超过资产阶级知识分子的革命的、战斗的、又红又专的队伍。\r\n    （四）左派要相互帮助\r\n    要形成大批的左派学术工作者的“互助组”、“合作社”，提倡在分头研究的基础上，经过集体讨论，分工分头执笔，用适当的方式互相批评和互相帮助，反对自以为是。警惕左派学术工作者走上资产阶级专家、学阀的道路。要重视在斗争中出现的优秀的青年作者，加以培养和帮助。\r\n    即使是坚定的左派（从长期表现来看），也难免因为旧思想没有彻底清理或者因为对新问题认识不清，在某个时候说过些错话，在某些问题上犯过大大小小的错误，要在适当的时机，用内部少数人学习整风的办法，清理一下，弄清是非，增加免疫性、抵抗力。只要错误已经改正，或者决心改正就好。不要彼此揪住不放，妨碍对资产阶级学术的批判和自己的前进。\r\n    （五）争论的问题，现在就要着手准备，到一定时期，在报刊上再发表一些质量较高的文章。\r\n    （六）五人小组设立学术批判的办公室\r\n    办公室由许立群、胡绳、吴冷西、姚溱、王力、范若愚等同志组成。许立群同志为主任，胡绳同志负责主持学术方面的工作。',
            },
            deletedCount: 4234,
        },
        {
            description: 'DBF with deleted records included in results and non latin-1 headers',
            filename: 'dbase_not_latin1.dbf',
            options: {includeDeletedRecords: true, encoding: 'big5'},
            recordCount: 2,
            dateOfLastUpdate: new Date('1998-09-13'),
            firstRecord: {畜主姓名: '徐', 電話: '292', 地址: '台北縣永和', 微晶片號碼: '00013', 狂犬病牌號: '87A', 犬名: '小小', 品種: '約克夏', 性別: '公', 出生日期: new Date('1991-04-16'), 登入日期: new Date('1998-04-28')},
            lastRecord: {[DELETED]: true, 畜主姓名: 'Chen', 電話: '0123456789', 地址: 'Fake address', 微晶片號碼: '000000', 狂犬病牌號: '000000', 犬名: 'Dog', 品種: 'Dog', 性別: '母', 出生日期: new Date('2023-09-13'), 登入日期: new Date('2023-09-13')},
            deletedCount: 0,
        },
    ];

    tests.forEach(test => {
        it(`readRecords: ${test.description}`, async () => {
            let filepath = path.join(__dirname, `./fixtures/${test.filename}`);
            let options = test.options;
            let expectedRecordCount = test.recordCount;
            let expectedDateOfLastUpdate = test.dateOfLastUpdate;
            let numberOfRecordsToRead = test.numberOfRecordsToRead;
            let expectedFirstRecord = test.firstRecord;
            let expectedLastRecord = test.lastRecord;
            let expectedDeletedCount = test.deletedCount;
            let expectedError = test.error;

            let dbf: DBFFile;
            let records: Array<Record<string, unknown> & {[DELETED]?: true}>;
            try {
                dbf = await DBFFile.open(filepath, options);
                records = await dbf.readRecords(numberOfRecordsToRead);
            }
            catch (err) {
                expect(err.message).contains(expectedError ?? '??????');
                return;
            }
            expect(dbf.recordCount, 'the record count should match').equals(expectedRecordCount);
            expect(dbf.dateOfLastUpdate, 'the date of last update should match').deep.equals(expectedDateOfLastUpdate);
            expect(records[0], 'first record should match').to.deep.include(expectedFirstRecord!);
            expect(records[0][DELETED], 'first record should match').equals(expectedFirstRecord![DELETED]);
            expect(records[records.length - 1], 'last record should match').to.deep.include(expectedLastRecord!);
            expect(records[records.length - 1][DELETED], 'last record should match').equals(expectedLastRecord![DELETED]);
            expect(dbf.recordCount - records.length, 'deleted records should match').equals(expectedDeletedCount);
            expect(undefined).equals(expectedError);
        });
    });

    tests.forEach(test => {
        it(`asyncIterator: ${test.description}`, async () => {
            let filepath = path.join(__dirname, `./fixtures/${test.filename}`);
            let options = test.options;
            let expectedRecordCount = test.recordCount;
            let expectedDateOfLastUpdate = test.dateOfLastUpdate;
            let numberOfRecordsToRead = test.numberOfRecordsToRead;
            let expectedFirstRecord = test.firstRecord;
            let expectedLastRecord = test.lastRecord;
            let expectedDeletedCount = test.deletedCount;
            let expectedError = test.error;

            let dbf: DBFFile;
            let records: Array<Record<string, unknown> & { [DELETED]?: true }> = [];
            try {
                dbf = await DBFFile.open(filepath, options);
                for await (const record of dbf) {
                    records.push(record);
                    if (numberOfRecordsToRead !== undefined && records.length >= numberOfRecordsToRead) break;
                }
            }
            catch (err) {
                expect(err.message).contains(expectedError ?? "??????");
                return;
            }
            expect(dbf.recordCount, 'the record count should match').equals(expectedRecordCount);
            expect(dbf.dateOfLastUpdate, 'the date of last update should match').deep.equals(expectedDateOfLastUpdate);
            expect(records[0], 'first record should match').to.deep.include(expectedFirstRecord!);
            expect(records[0][DELETED], 'first record should match').equals(expectedFirstRecord![DELETED]);
            expect(records[records.length - 1], 'last record should match').to.deep.include(expectedLastRecord!);
            expect(records[records.length - 1][DELETED], 'last record should match').equals(expectedLastRecord![DELETED]);
            expect(dbf.recordCount - records.length, 'deleted records should match').equals(expectedDeletedCount);
            expect(undefined).equals(expectedError);
        });
    });
});
