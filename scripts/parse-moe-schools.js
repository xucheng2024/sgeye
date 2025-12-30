/**
 * Parse MOE School List and Generate CSV
 * 
 * This script parses the school list provided and generates a CSV file
 */

const fs = require('fs')

// School data from MOE School Finder (provided by user)
const schoolData = `
Admiralty Primary School|Woodlands|11 Woodlands Circle, S738907
Ahmad Ibrahim Primary School|Yishun|10 Yishun Street 11, S768643
Ai Tong School|Bishan|100 Bright Hill Drive, S579646
Alexandra Primary School|Bukit Merah|2A Prince Charles Crescent, S159016
Anchor Green Primary School|Seng Kang|31 Anchorvale Drive, S544969
Anderson Primary School|Ang Mo Kio|19 Ang Mo Kio Ave 9, S569785
Ang Mo Kio Primary School|Ang Mo Kio|20 Ang Mo Kio Avenue 3, S569920
Anglo-Chinese School (Junior)|Central|16 Winstedt Road, S227988
Anglo-Chinese School (Primary)|Novena|50 Barker Road, S309918
Angsana Primary School|Tampines|51 Tampines Street 61, S528565
Beacon Primary School|Bukit Panjang|36 Bukit Panjang Ring Road, S679944
Bedok Green Primary School|Bedok|1 Bedok South Ave 2, S469317
Bendemeer Primary School|Kallang|91 Bendemeer Road, S339948
Blangah Rise Primary School|Bukit Merah|91 Telok Blangah Heights, S109100
Boon Lay Garden Primary School|Jurong West|20 Boon Lay Drive, S649930
Bukit Panjang Primary School|Bukit Panjang|109 Cashew Road, S679676
Bukit Timah Primary School|Bukit Timah|111 Lorong Kismis, S598112
Bukit View Primary School|Bukit Batok|18 Bukit Batok Street 21, S659634
Canberra Primary School|Sembawang|21 Admiralty Drive, S757714
Canossa Catholic Primary School|Geylang|1 Sallim Road, S387621
Cantonment Primary School|Bukit Merah|1 Cantonment Close, S088256
Casuarina Primary School|Pasir Ris|30 Pasir Ris St 41, S518935
Catholic High School (Primary Section)|Bishan|9 Bishan Street 22, S579767
Cedar Primary School|Toa Payoh|15 Cedar Avenue, S349700
Changkat Primary School|Tampines|11 Simei St 3, S529896
CHIJ (Katong) Primary|Bedok|17 Martia Road, S424821
CHIJ (Kellock)|Bukit Merah|1 Bukit Teresa Road, S099757
CHIJ Our Lady of Good Counsel|Serangoon|2C Burghley Drive, S558979
CHIJ Our Lady of the Nativity|Hougang|1257 Upper Serangoon Road, S534793
CHIJ Our Lady Queen of Peace|Bukit Panjang|4 Chestnut Drive, S679287
CHIJ Primary (Toa Payoh)|Toa Payoh|628 Lorong 1 Toa Payoh, S319765
CHIJ St. Nicholas Girls' School (Primary Section)|Ang Mo Kio|501 Ang Mo Kio Street 13, S569405
Chongfu School|Yishun|170 Yishun Avenue 6, S768959
Chongzheng Primary School|Tampines|1 Tampines Street 21, S529392
Chua Chu Kang Primary School|Choa Chu Kang|20 Choa Chu Kang Avenue 2, S689905
Clementi Primary School|Clementi|8 Clementi Ave 3, S129903
Compassvale Primary School|Seng Kang|21 Compassvale St, S545091
Concord Primary School|Choa Chu Kang|3 Choa Chu Kang Ave 4, S689814
Corporation Primary School|Jurong West|31 Jurong West Street 24, S648347
Damai Primary School|Bedok|52 Bedok Reservoir Crescent, S479226
Dazhong Primary School|Bukit Batok|35 Bukit Batok Street 31, S659441
De La Salle School|Choa Chu Kang|11 Choa Chu Kang St 52, S689285
East Spring Primary School|Tampines|31 Tampines St 33, S529258
Edgefield Primary School|Punggol|41 Edgefield Plains, S828869
Elias Park Primary School|Pasir Ris|11 Pasir Ris Street 52, S518866
Endeavour Primary School|Sembawang|10 Admiralty Link, S757521
Evergreen Primary School|Woodlands|31 Woodlands Circle, S738908
Fairfield Methodist School (Primary)|Queenstown|100 Dover Road, S139648
Farrer Park Primary School|Kallang|2 Farrer Park Road, S217567
Fengshan Primary School|Bedok|307 Bedok North Road, S469680
Fern Green Primary School|Seng Kang|70 Fernvale Link, S797538
Fernvale Primary School|Seng Kang|1 Fernvale Lane, S797701
First Toa Payoh Primary School|Toa Payoh|7 Lorong 8 Toa Payoh, S319252
Frontier Primary School|Jurong West|20 Jurong West Street 61, S648200
Fuchun Primary School|Woodlands|23 Woodlands Avenue 1, S739063
Fuhua Primary School|Jurong East|65 Jurong East Street 13, S609647
Gan Eng Seng Primary School|Bukit Merah|100 Redhill Close, S158901
Geylang Methodist School (Primary)|Geylang|4 Geylang East Central, S389706
Gongshang Primary School|Tampines|1 Tampines Street 42, S529176
Greendale Primary School|Punggol|50 Edgedale Plains, S828848
Greenridge Primary School|Bukit Panjang|11 Jelapang Road, S677744
Greenwood Primary School|Woodlands|11 Woodlands Dr 62, S737942
Haig Girls' School|Geylang|51 Koon Seng Road, S427072
Henry Park Primary School|Bukit Timah|1 Holland Grove Road, S278790
Holy Innocents' Primary School|Hougang|5 Lorong Low Koon, S536451
Hong Wen School|Kallang|30 Towner Road, S327829
Horizon Primary School|Punggol|61 Edgedale Plains, S828819
Hougang Primary School|Hougang|1 Hougang St 93, S534238
Huamin Primary School|Yishun|21 Yishun Avenue 11, S768857
Innova Primary School|Woodlands|80 Woodlands Drive 17, S737888
Jiemin Primary School|Yishun|2 Yishun Street 71, S768515
Jing Shan Primary School|Ang Mo Kio|5 Ang Mo Kio St 52, S569228
Junyuan Primary School|Tampines|2 Tampines Street 91, S528906
Jurong Primary School|Jurong East|320 Jurong East Street 32, S609476
Jurong West Primary School|Jurong West|30 Jurong West St 61, S648368
Keming Primary School|Bukit Batok|90 Bukit Batok East Avenue 6, S659762
Kheng Cheng School|Toa Payoh|15 Lorong 3 Toa Payoh, S319580
Kong Hwa School|Geylang|350 Guillemard Road, S399772
Kranji Primary School|Choa Chu Kang|11 Choa Chu Kang Street 54, S689189
Kuo Chuan Presbyterian Primary School|Bishan|8 Bishan Street 13, S579793
Lakeside Primary School|Jurong West|161 Corporation Walk, S618310
Lianhua Primary School|Bukit Batok|2 Bukit Batok Street 52, S659243
Maha Bodhi School|Geylang|10 Ubi Avenue 1, S408931
Maris Stella High School (Primary Section)|Toa Payoh|25 Mount Vernon Road, S368051
Marsiling Primary School|Woodlands|31 Woodlands Centre Road, S738927
Marymount Convent School|Toa Payoh|20 Marymount Road, S297754
Mayflower Primary School|Ang Mo Kio|200 Ang Mo Kio Avenue 5, S569878
Mee Toh School|Punggol|21 Edgedale Plains, S828867
Meridian Primary School|Pasir Ris|20 Pasir Ris St 71, S518798
Methodist Girls' School (Primary)|Bukit Timah|11 Blackmore Drive, S599986
Montfort Junior School|Hougang|52 Hougang Avenue 8, S538786
Nan Chiau Primary School|Seng Kang|50 Anchorvale Link, S545080
Nan Hua Primary School|Clementi|30 Jalan Lempeng, S128806
Nanyang Primary School|Bukit Timah|52 King's Road, S268097
Naval Base Primary School|Yishun|7 Yishun Ave 4, S769028
New Town Primary School|Queenstown|300 Tanglin Halt Road, S148812
Ngee Ann Primary School|Marine Parade|344 Marine Terrace, S449149
North Spring Primary School|Seng Kang|1 Rivervale Street, S545088
North View Primary School|Yishun|210 Yishun Avenue 6, S768960
North Vista Primary School|Seng Kang|20 Compassvale Link, S544974
Northland Primary School|Yishun|15 Yishun Avenue 4, S769026
Northoaks Primary School|Sembawang|61 Sembawang Drive, S757622
Northshore Primary School|Punggol|30 Northshore Drive, S828671
Oasis Primary School|Punggol|71 Edgefield Plains, S828716
Opera Estate Primary School|Bedok|48 Fidelio Street, S458436
Palm View Primary School|Seng Kang|150 Compassvale Bow, S544822
Park View Primary School|Pasir Ris|60 Pasir Ris Drive 1, S519524
Pasir Ris Primary School|Pasir Ris|5 Pasir Ris Street 21, S518968
Paya Lebar Methodist Girls' School (Primary)|Hougang|298 Lorong Ah Soo, S536741
Pei Chun Public School|Toa Payoh|16 Lorong 7 Toa Payoh, S319320
Pei Hwa Presbyterian Primary School|Bukit Timah|7 Pei Wah Avenue, S597610
Pei Tong Primary School|Clementi|15 Clementi Avenue 5, S129857
Peiying Primary School|Yishun|651 Yishun Ring Road, S768687
Pioneer Primary School|Tengah|80 Tengah Garden Avenue, S699915
Poi Ching School|Tampines|21 Tampines Street 71, S529067
Princess Elizabeth Primary School|Bukit Batok|30 Bukit Batok West Avenue 3, S659163
Punggol Cove Primary School|Punggol|52 Sumang Walk, S828674
Punggol Green Primary School|Punggol|98 Punggol Walk, S828772
Punggol Primary School|Hougang|61 Hougang Avenue 8, S538787
Punggol View Primary School|Punggol|9 Punggol Place, S828845
Qifa Primary School|Clementi|50 West Coast Avenue, S128104
Qihua Primary School|Woodlands|5 Woodlands Street 81, S738525
Queenstown Primary School|Queenstown|310 Margaret Dr, S149303
Radin Mas Primary School|Bukit Merah|1 Bukit Purmei Avenue, S099840
Raffles Girls' Primary School|Bukit Timah|21 Hillcrest Road, S289072
Red Swastika School|Bedok|350 Bedok North Avenue 3, S469719
River Valley Primary School|Central|2 River Valley Green, S237993
Riverside Primary School|Woodlands|110 Woodlands Crescent, S737803
Rivervale Primary School|Seng Kang|80 Rivervale Drive, S545092
Rosyth School|Serangoon|21 Serangoon North Avenue 4, S555855
Rulang Primary School|Jurong West|6 Jurong West Street 52, S649295
Sembawang Primary School|Sembawang|10 Sembawang Drive, S757715
Seng Kang Primary School|Seng Kang|21 Compassvale Walk, S545166
Sengkang Green Primary School|Seng Kang|15 Fernvale Road, S797636
Shuqun Primary School|Jurong West|8 Jurong West Street 51, S649332
Si Ling Primary School|Woodlands|61 Woodlands Avenue 1, S739067
Singapore Chinese Girls' Primary School|Novena|190 Dunearn Road, S309437
South View Primary School|Choa Chu Kang|6 Choa Chu Kang Central, S689762
Springdale Primary School|Seng Kang|71 Anchorvale Link, S544799
St Andrew's School (Junior)|Toa Payoh|2 Francis Thomas Drive, S359337
St. Anthony's Canossian Primary School|Bedok|1602 Bedok North Ave 4, S469701
St. Anthony's Primary School|Bukit Batok|30 Bukit Batok St 32, S659401
St. Gabriel's Primary School|Serangoon|220 Lorong Chuan, S556742
St. Hilda's Primary School|Tampines|2 Tampines Ave 3, S529706
St. Joseph's Institution Junior|Novena|3 Essex Road, S309331
St. Margaret's School (Primary)|Central|136 Sophia Road, S228197
St. Stephen's School|Bedok|20 Siglap View, S455789
Tampines North Primary School|Tampines|30 Tampines Avenue 9, S529565
Tampines Primary School|Tampines|250 Tampines Street 12, S529426
Tanjong Katong Primary School|Marine Parade|10 Seraya Road, S437259
Tao Nan School|Marine Parade|49 Marine Crescent, S449761
Teck Ghee Primary School|Ang Mo Kio|1 Ang Mo Kio Street 32, S569299
Teck Whye Primary School|Choa Chu Kang|11 Teck Whye Walk, S688261
Telok Kurau Primary School|Bedok|50 Bedok Reservoir Rd, S479239
Temasek Primary School|Bedok|501 Bedok South Ave 3, S469300
Townsville Primary School|Ang Mo Kio|3 Ang Mo Kio Ave 10, S569730
Unity Primary School|Choa Chu Kang|21 Choa Chu Kang Crescent, S688268
Valour Primary School|Punggol|49 Punggol Central, S828728
Waterway Primary School|Punggol|70 Punggol Drive, S828802
Wellington Primary School|Sembawang|10 Wellington Circle, S757702
West Grove Primary School|Jurong West|1 Jurong West St 72, S649223
West Spring Primary School|Bukit Panjang|60 Bukit Panjang Ring Road, S679946
West View Primary School|Bukit Panjang|31 Senja Road, S677742
Westwood Primary School|Jurong West|1 Jurong West Street 73, S649188
White Sands Primary School|Pasir Ris|2 Pasir Ris St 11, S519075
Woodgrove Primary School|Woodlands|2 Woodlands Drive 14, S738079
Woodlands Primary School|Woodlands|10 Woodlands Drive 50, S738853
Woodlands Ring Primary School|Woodlands|11 Woodlands Ring Road, S738240
Xinghua Primary School|Hougang|45 Hougang Avenue 1, S538882
Xingnan Primary School|Jurong West|5 Jurong West Street 91, S649036
Xinmin Primary School|Hougang|9 Hougang Avenue 8, S538784
Xishan Primary School|Yishun|8 Yishun Street 21, S768611
Yangzheng Primary School|Serangoon|15 Serangoon Avenue 3, S556108
Yew Tee Primary School|Choa Chu Kang|10 Choa Chu Kang St 64, S689100
Yio Chu Kang Primary School|Hougang|1 Hougang Street 51, S538720
Yishun Primary School|Yishun|500 Yishun Ring Road, S768679
Yu Neng Primary School|Bedok|56 Bedok North St 3, S469623
Yuhua Primary School|Jurong East|158 Jurong East Street 24, S609558
Yumin Primary School|Tampines|3 Tampines Street 21, S529393
Zhangde Primary School|Bukit Merah|51 Jalan Membina, S169485
Zhenghua Primary School|Bukit Panjang|9 Fajar Road, S679002
Zhonghua Primary School|Serangoon|12 Serangoon Avenue 4, S556095
`.trim().split('\n').filter(line => line.trim())

// Parse and extract postal code from address
function parseAddress(address) {
  // Extract postal code (S followed by 6 digits)
  const postalMatch = address.match(/S(\d{6})/)
  const postalCode = postalMatch ? postalMatch[1] : ''
  
  // Remove postal code from address
  const cleanAddress = address.replace(/\s*S\d{6}\s*/, '').trim()
  
  return { address: cleanAddress, postalCode }
}

// Map town names to match our database format
function normalizeTown(town) {
  const townMap = {
    'Seng Kang': 'SENGKANG',
    'Bukit Panjang': 'BUKIT PANJANG',
    'Bukit Timah': 'BUKIT TIMAH',
    'Bukit Batok': 'BUKIT BATOK',
    'Bukit Merah': 'BUKIT MERAH',
    'Choa Chu Kang': 'CHOA CHU KANG',
    'Jurong East': 'JURONG EAST',
    'Jurong West': 'JURONG WEST',
    'Ang Mo Kio': 'ANG MO KIO',
    'Pasir Ris': 'PASIR RIS',
    'Tampines': 'TAMPINES',
    'Woodlands': 'WOODLANDS',
    'Yishun': 'YISHUN',
    'Clementi': 'CLEMENTI',
    'Queenstown': 'QUEENSTOWN',
    'Toa Payoh': 'TOA PAYOH',
    'Bishan': 'BISHAN',
    'Bedok': 'BEDOK',
    'Hougang': 'HOUGANG',
    'Serangoon': 'SERANGOON',
    'Punggol': 'PUNGGOL',
    'Sembawang': 'SEMBAWANG',
    'Geylang': 'GEYLANG',
    'Kallang': 'KALLANG/WHAMPOA',
    'Marine Parade': 'MARINE PARADE',
    'Central': 'CENTRAL AREA',
    'Novena': 'CENTRAL AREA',
    'Tengah': 'CHOA CHU KANG' // Tengah is new, map to nearest
  }
  
  return townMap[town] || town.toUpperCase()
}

// Generate CSV
console.log('school_name,address,postal_code,planning_area,town,latitude,longitude')

schoolData.forEach(line => {
  const [name, town, addressWithPostal] = line.split('|')
  const { address, postalCode } = parseAddress(addressWithPostal)
  const normalizedTown = normalizeTown(town)
  
  console.log(`"${name}","${address}","${postalCode}","${normalizedTown}","${normalizedTown}","",""`)
})

