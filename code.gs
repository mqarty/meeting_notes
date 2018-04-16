function create_meeting_notes() {
  /* Create meetin notes for today */
  
  var today = new Date();
  var formatted_today = Utilities.formatDate(today, "EDT","yyyy-MM-dd");   
  
  var meeting_notes_folder = find_meeting_notes_folder();
  var todays_meeting_folder = find_todays_meeting_notes_folder(meeting_notes_folder, formatted_today);
  var events = get_events_by_date_and_interval(today, 2);
  
  events.forEach(function(event){
    create_meeting_note_in_folder_by_event(todays_meeting_folder, event)
  });
}


function find_meeting_notes_folder(){
  /* Create and/or Find meeting notes folder*/
  
  if (DriveApp.getFoldersByName('Meeting Notes').hasNext()){
    Logger.log("`Meeting Notes` folder exists");
    return DriveApp.getFoldersByName('Meeting Notes').next();
  }
  
  Logger.log('Creating `Meeting Notes` folder');
  return DriveApp.createFolder('Meeting Notes');
}

function find_todays_meeting_notes_folder(meeting_notes_folder, formatted_today){
  /* Create and/or Find today's meeting notes folder */

  if (meeting_notes_folder.getFoldersByName(formatted_today).hasNext()){
    Logger.log("Today's (" + formatted_today + " folder exists");
    return meeting_notes_folder.getFoldersByName(formatted_today).next();
  }

  Logger.log('Creating folder with formatted_today as ' + formatted_today);
  return meeting_notes_folder.createFolder(formatted_today);
}

function get_events_by_date_and_interval(date, interval){
  /* Retrieve today's events by interval (Hours) */

  var period_from_now = new Date(
    date.getTime() + (interval * 60 * 60 * 1000)
  );
  
  return CalendarApp.getDefaultCalendar().getEvents(new Date(), period_from_now);  
}

function update_note(note, event){  
  body = note.getBody();
  
  title_style = {};
  title_style[DocumentApp.Attribute.BOLD] = true;
  title_style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#27A0B6';
  
  title = body.insertParagraph(0, event.getTitle());
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAttributes(title_style);
  
  starts = body.insertParagraph(1, 'Start:  ' + event.getStartTime());
  starts.setHeading(DocumentApp.ParagraphHeading.HEADING4);
  
  ends = body.insertParagraph(2, 'End:  ' + event.getEndTime());
  ends.setHeading(DocumentApp.ParagraphHeading.HEADING4);
  
  location = body.insertParagraph(3, 'Location:  ' + event.getLocation());
  location.setHeading(DocumentApp.ParagraphHeading.HEADING4);
  
  owner = body.insertParagraph(4, 'Owner:  ' + event.getCreators());
  owner.setHeading(DocumentApp.ParagraphHeading.HEADING4);
  
  agenda = body.insertParagraph(5, 'Agenda/Description:');
  agenda.setHeading(DocumentApp.ParagraphHeading.HEADING4);
  
  agenda_description = body.appendParagraph(event.getDescription());
  agenda_description.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  
  guests = body.appendParagraph('Guest list:');
  guests.setHeading(DocumentApp.ParagraphHeading.HEADING4);
  guest_list = event.getGuestList();
  for (var i in guest_list){
    guest = guest_list[i];
    guest_info = body.appendParagraph(guest.getEmail() + ':' + guest.getGuestStatus());
    guest_info.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  }
  
  style = {};
  style[DocumentApp.Attribute.FOREGROUND_COLOR] = '#C1C7CD';
  discussion = body.appendParagraph('Discussion:');
  discussion.setHeading(DocumentApp.ParagraphHeading.HEADING4);
  body.appendListItem("Stuff we actually talked about").setAttributes(style).setGlyphType(DocumentApp.GlyphType.BULLET);
  
  action_items = body.appendParagraph('Action Items:');
  action_items.setHeading(DocumentApp.ParagraphHeading.HEADING4);
  body.appendListItem("").setAttributes(style);
  
}

function create_meeting_note_in_folder_by_event(folder, event){
  var title = event.getTitle();

  if (event.getGuestList() == 0){
    return;
  }
  
  if (folder.getFilesByName(title).hasNext()){
    return;
  }
   
  var note = DocumentApp.create(title);
  var note_file = DriveApp.getFileById(note.getId());
  
  DriveApp.getFolderById(folder.getId()).addFile(note_file);
  DriveApp.getRootFolder().removeFile(note_file);
  
  update_note(note, event);
}
